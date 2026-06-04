// 足球球队网站PWA Service Worker
// 版本: 1.0.0
// 缓存名称
const CACHE_NAME = 'football-team-v1';
const OFFLINE_CACHE = 'football-offline-v1';

// 需要缓存的资源
const STATIC_RESOURCES = [
  '/',
  '/index.html',
  '/manifest.json',
  '/styles.css',
  '/App.jsx',
  // 图标资源
  '/icons/icon-72x72.png',
  '/icons/icon-96x96.png',
  '/icons/icon-128x128.png',
  '/icons/icon-144x144.png',
  '/icons/icon-152x152.png',
  '/icons/icon-192x192.png',
  '/icons/icon-384x384.png',
  '/icons/icon-512x512.png',
  // 离线页面
  '/offline.html'
];

// 安装事件 - 预缓存关键资源
self.addEventListener('install', event => {
  console.log('[Service Worker] 安装中...');
  
  event.waitUntil(
    Promise.all([
      // 缓存静态资源
      caches.open(CACHE_NAME).then(cache => {
        console.log('[Service Worker] 缓存静态资源');
        return cache.addAll(STATIC_RESOURCES);
      }),
      // 缓存离线页面
      caches.open(OFFLINE_CACHE).then(cache => {
        console.log('[Service Worker] 缓存离线页面');
        return cache.add('/offline.html');
      })
    ])
  );
  
  // 跳过等待，立即激活
  self.skipWaiting();
});

// 激活事件 - 清理旧缓存
self.addEventListener('activate', event => {
  console.log('[Service Worker] 激活中...');
  
  event.waitUntil(
    caches.keys().then(cacheNames => {
      return Promise.all(
        cacheNames.map(cacheName => {
          // 删除旧版本的缓存
          if (cacheName !== CACHE_NAME && cacheName !== OFFLINE_CACHE) {
            console.log('[Service Worker] 删除旧缓存:', cacheName);
            return caches.delete(cacheName);
          }
        })
      );
    })
  );
  
  // 立即控制所有客户端
  self.clients.claim();
});

// 获取事件 - 网络优先，缓存兜底策略
self.addEventListener('fetch', event => {
  // 跳过非GET请求和浏览器扩展
  if (event.request.method !== 'GET' || 
      event.request.url.startsWith('chrome-extension://') ||
      event.request.url.includes('browser-sync')) {
    return;
  }
  
  // 处理API请求 - 网络优先，失败时使用缓存
  if (event.request.url.includes('/api/')) {
    event.respondWith(
      fetch(event.request)
        .then(response => {
          // 克隆响应以缓存
          const responseClone = response.clone();
          caches.open(CACHE_NAME).then(cache => {
            cache.put(event.request, responseClone);
          });
          return response;
        })
        .catch(() => {
          // 网络失败时尝试从缓存获取
          return caches.match(event.request);
        })
    );
    return;
  }
  
  // 处理静态资源 - 缓存优先策略
  event.respondWith(
    caches.match(event.request)
      .then(cachedResponse => {
        if (cachedResponse) {
          // 从缓存返回，同时后台更新
          fetch(event.request)
            .then(response => {
              // 更新缓存
              caches.open(CACHE_NAME).then(cache => {
                cache.put(event.request, response);
              });
            })
            .catch(() => {
              // 网络更新失败，继续使用缓存
            });
          return cachedResponse;
        }
        
        // 缓存中没有，从网络获取
        return fetch(event.request)
          .then(response => {
            // 检查响应是否有效
            if (!response || response.status !== 200 || response.type !== 'basic') {
              return response;
            }
            
            // 克隆响应以缓存
            const responseToCache = response.clone();
            caches.open(CACHE_NAME).then(cache => {
              cache.put(event.request, responseToCache);
            });
            
            return response;
          })
          .catch(() => {
            // 网络失败，返回离线页面
            return caches.match('/offline.html');
          });
      })
  );
});

// 后台同步 - 用于离线数据同步
self.addEventListener('sync', event => {
  console.log('[Service Worker] 后台同步事件:', event.tag);
  
  if (event.tag === 'sync-player-data') {
    event.waitUntil(syncPlayerData());
  }
});

// 推送通知事件
self.addEventListener('push', event => {
  console.log('[Service Worker] 推送通知收到:', event);
  
  if (!event.data) return;
  
  const data = event.data.json();
  const options = {
    body: data.body || '球队网站有新消息',
    icon: '/icons/icon-192x192.png',
    badge: '/icons/icon-72x72.png',
    vibrate: [200, 100, 200],
    data: {
      url: data.url || '/'
    },
    actions: [
      {
        action: 'open',
        title: '查看详情'
      },
      {
        action: 'close',
        title: '关闭'
      }
    ]
  };
  
  event.waitUntil(
    self.registration.showNotification(data.title || '城市猎人FC', options)
  );
});

// 通知点击事件
self.addEventListener('notificationclick', event => {
  console.log('[Service Worker] 通知被点击:', event.notification.tag);
  
  event.notification.close();
  
  if (event.action === 'close') {
    return;
  }
  
  // 打开网站
  event.waitUntil(
    clients.matchAll({ type: 'window', includeUncontrolled: true })
      .then(clientList => {
        // 如果已经有打开的窗口，聚焦它
        for (const client of clientList) {
          if (client.url.includes(event.notification.data.url) && 'focus' in client) {
            return client.focus();
          }
        }
        
        // 否则打开新窗口
        if (clients.openWindow) {
          return clients.openWindow(event.notification.data.url);
        }
      })
  );
});

// 同步球员数据函数
async function syncPlayerData() {
  try {
    // 从IndexedDB获取离线数据
    const offlineData = await getOfflineData();
    
    if (offlineData && offlineData.length > 0) {
      // 这里应该调用实际的API同步数据
      console.log('[Service Worker] 同步离线数据:', offlineData.length, '条记录');
      
      // 模拟API调用
      const responses = await Promise.all(
        offlineData.map(data => 
          fetch('/api/sync', {
            method: 'POST',
            headers: {
              'Content-Type': 'application/json'
            },
            body: JSON.stringify(data)
          })
        )
      );
      
      // 同步成功后清除离线数据
      await clearOfflineData();
      
      // 发送通知
      self.registration.showNotification('数据同步完成', {
        body: `成功同步${offlineData.length}条数据`,
        icon: '/icons/icon-192x192.png'
      });
      
      return true;
    }
  } catch (error) {
    console.error('[Service Worker] 数据同步失败:', error);
    return false;
  }
}

// 从IndexedDB获取离线数据
function getOfflineData() {
  return new Promise((resolve) => {
    // 这里应该实现IndexedDB读取逻辑
    // 为了简化，返回模拟数据
    resolve([]);
  });
}

// 清除离线数据
function clearOfflineData() {
  return new Promise((resolve) => {
    // 这里应该实现IndexedDB清除逻辑
    resolve();
  });
}

// 定期清理缓存
self.addEventListener('periodicsync', event => {
  if (event.tag === 'cleanup-cache') {
    event.waitUntil(cleanupOldCache());
  }
});

// 清理旧缓存
async function cleanupOldCache() {
  const cacheNames = await caches.keys();
  const now = Date.now();
  
  for (const cacheName of cacheNames) {
    if (cacheName.startsWith('football-team-')) {
      const cache = await caches.open(cacheName);
      const requests = await cache.keys();
      
      for (const request of requests) {
        const response = await cache.match(request);
        if (response) {
          const dateHeader = response.headers.get('date');
          if (dateHeader) {
            const cachedDate = new Date(dateHeader).getTime();
            // 删除30天前的缓存
            if (now - cachedDate > 30 * 24 * 60 * 60 * 1000) {
              await cache.delete(request);
            }
          }
        }
      }
    }
  }
}