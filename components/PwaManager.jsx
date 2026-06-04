import React, { useState, useEffect } from 'react';
import './PwaManager.css';

const PwaManager = () => {
  const [isPwaSupported, setIsPwaSupported] = useState(false);
  const [isInstalled, setIsInstalled] = useState(false);
  const [isOnline, setIsOnline] = useState(true);
  const [storageUsage, setStorageUsage] = useState(0);
  const [cacheSize, setCacheSize] = useState(0);
  const [pushPermission, setPushPermission] = useState('default');
  const [backgroundSync, setBackgroundSync] = useState(false);
  const [serviceWorkerStatus, setServiceWorkerStatus] = useState('unknown');

  useEffect(() => {
    // 检查PWA支持
    const checkPwaSupport = () => {
      const supported = 'serviceWorker' in navigator && 'PushManager' in window;
      setIsPwaSupported(supported);
      
      // 检查是否已安装
      const standalone = window.matchMedia('(display-mode: standalone)').matches;
      setIsInstalled(standalone);
      
      // 检查网络状态
      setIsOnline(navigator.onLine);
      
      // 检查推送权限
      if ('Notification' in window) {
        setPushPermission(Notification.permission);
      }
      
      // 检查后台同步
      if ('serviceWorker' in navigator && navigator.serviceWorker.controller) {
        setBackgroundSync('sync' in navigator.serviceWorker.controller);
      }
      
      // 检查Service Worker状态
      if ('serviceWorker' in navigator) {
        navigator.serviceWorker.ready.then(registration => {
          setServiceWorkerStatus('active');
        }).catch(() => {
          setServiceWorkerStatus('inactive');
        });
      }
    };

    checkPwaSupport();

    // 监听网络状态变化
    const handleOnline = () => setIsOnline(true);
    const handleOffline = () => setIsOnline(false);
    
    window.addEventListener('online', handleOnline);
    window.addEventListener('offline', handleOffline);

    // 计算存储使用情况
    const calculateStorage = () => {
      if ('storage' in navigator && 'estimate' in navigator.storage) {
        navigator.storage.estimate().then(estimate => {
          const usage = estimate.usage || 0;
          const quota = estimate.quota || 1;
          setStorageUsage(Math.round((usage / quota) * 100));
        });
      }
      
      // 计算缓存大小
      if ('caches' in window) {
        caches.keys().then(cacheNames => {
          let totalSize = 0;
          const promises = cacheNames.map(cacheName => 
            caches.open(cacheName).then(cache => 
              cache.keys().then(requests => 
                Promise.all(requests.map(request => 
                  cache.match(request).then(response => 
                    response ? response.blob().then(blob => blob.size) : 0
                  )
                ))
              )
            )
          );
          
          Promise.all(promises).then(sizes => {
            sizes.forEach(sizeList => {
              sizeList.forEach(size => {
                totalSize += size;
              });
            });
            setCacheSize(Math.round(totalSize / 1024 / 1024 * 100) / 100); // MB
          });
        });
      }
    };

    calculateStorage();

    return () => {
      window.removeEventListener('online', handleOnline);
      window.removeEventListener('offline', handleOffline);
    };
  }, []);

  const requestPushPermission = async () => {
    if (!('Notification' in window)) return;
    
    const permission = await Notification.requestPermission();
    setPushPermission(permission);
    
    if (permission === 'granted' && 'serviceWorker' in navigator) {
      try {
        const registration = await navigator.serviceWorker.ready;
        const subscription = await registration.pushManager.subscribe({
          userVisibleOnly: true,
          applicationServerKey: urlBase64ToUint8Array(
            'YOUR_VAPID_PUBLIC_KEY' // 替换为实际的VAPID公钥
          )
        });
        
        console.log('推送订阅成功:', subscription);
        // 发送订阅信息到服务器
      } catch (error) {
        console.error('推送订阅失败:', error);
      }
    }
  };

  const clearCache = async () => {
    if (!('caches' in window)) return;
    
    try {
      const cacheNames = await caches.keys();
      await Promise.all(cacheNames.map(cacheName => caches.delete(cacheName)));
      
      setCacheSize(0);
      alert('缓存已清除');
      
      // 重新注册Service Worker
      if ('serviceWorker' in navigator) {
        const registration = await navigator.serviceWorker.ready;
        registration.update();
      }
    } catch (error) {
      console.error('清除缓存失败:', error);
      alert('清除缓存失败');
    }
  };

  const triggerBackgroundSync = async () => {
    if (!('serviceWorker' in navigator)) return;
    
    try {
      const registration = await navigator.serviceWorker.ready;
      if ('sync' in registration) {
        await registration.sync.register('sync-player-data');
        alert('后台同步已触发');
      } else {
        alert('后台同步不可用');
      }
    } catch (error) {
      console.error('后台同步失败:', error);
      alert('后台同步失败');
    }
  };

  const testNotification = () => {
    if (!('Notification' in window) || Notification.permission !== 'granted') {
      alert('请先启用推送通知权限');
      return;
    }
    
    if ('serviceWorker' in navigator) {
      navigator.serviceWorker.ready.then(registration => {
        registration.showNotification('测试通知', {
          body: '这是来自城市猎人FC的测试推送通知',
          icon: '/icons/icon-192x192.png',
          badge: '/icons/icon-72x72.png',
          vibrate: [200, 100, 200],
          tag: 'test-notification',
          data: { url: '/' }
        });
      });
    }
  };

  const urlBase64ToUint8Array = (base64String) => {
    const padding = '='.repeat((4 - base64String.length % 4) % 4);
    const base64 = (base64String + padding)
      .replace(/\-/g, '+')
      .replace(/_/g, '/');
    
    const rawData = window.atob(base64);
    const outputArray = new Uint8Array(rawData.length);
    
    for (let i = 0; i < rawData.length; ++i) {
      outputArray[i] = rawData.charCodeAt(i);
    }
    
    return outputArray;
  };

  if (!isPwaSupported) {
    return (
      <div className="pwa-manager">
        <div className="pwa-status-card error">
          <h3>⚠️ PWA功能不支持</h3>
          <p>您的浏览器不支持PWA功能，请使用最新版本的Chrome、Edge或Firefox浏览器。</p>
        </div>
      </div>
    );
  }

  return (
    <div className="pwa-manager">
      <div className="pwa-header">
        <h2>PWA应用管理</h2>
        <p>管理您的离线应用功能和设置</p>
      </div>

      <div className="pwa-status-grid">
        <div className="pwa-status-card">
          <div className="pwa-status-icon">📱</div>
          <div className="pwa-status-content">
            <h3>应用状态</h3>
            <p>{isInstalled ? '✅ 已安装为独立应用' : '🌐 运行在浏览器中'}</p>
          </div>
        </div>

        <div className="pwa-status-card">
          <div className="pwa-status-icon">📶</div>
          <div className="pwa-status-content">
            <h3>网络状态</h3>
            <p>{isOnline ? '✅ 在线' : '❌ 离线'}</p>
          </div>
        </div>

        <div className="pwa-status-card">
          <div className="pwa-status-icon">🔔</div>
          <div className="pwa-status-content">
            <h3>推送通知</h3>
            <p>
              {pushPermission === 'granted' ? '✅ 已启用' : 
               pushPermission === 'denied' ? '❌ 已禁用' : '⚪ 未设置'}
            </p>
          </div>
        </div>

        <div className="pwa-status-card">
          <div className="pwa-status-icon">⚙️</div>
          <div className="pwa-status-content">
            <h3>Service Worker</h3>
            <p>{serviceWorkerStatus === 'active' ? '✅ 运行中' : '❌ 未运行'}</p>
          </div>
        </div>
      </div>

      <div className="pwa-storage-section">
        <h3>存储使用情况</h3>
        <div className="pwa-storage-info">
          <div className="pwa-storage-bar">
            <div 
              className="pwa-storage-fill" 
              style={{ width: `${storageUsage}%` }}
            ></div>
          </div>
          <div className="pwa-storage-details">
            <span>缓存大小: {cacheSize} MB</span>
            <span>使用率: {storageUsage}%</span>
          </div>
        </div>
      </div>

      <div className="pwa-actions-section">
        <h3>功能管理</h3>
        <div className="pwa-actions-grid">
          <button 
            className="pwa-action-btn"
            onClick={requestPushPermission}
            disabled={pushPermission === 'granted'}
          >
            <span className="pwa-action-icon">🔔</span>
            <span>启用推送通知</span>
          </button>

          <button 
            className="pwa-action-btn"
            onClick={clearCache}
          >
            <span className="pwa-action-icon">🗑️</span>
            <span>清除缓存</span>
          </button>

          <button 
            className="pwa-action-btn"
            onClick={triggerBackgroundSync}
            disabled={!backgroundSync}
          >
            <span className="pwa-action-icon">🔄</span>
            <span>后台同步</span>
          </button>

          <button 
            className="pwa-action-btn"
            onClick={testNotification}
            disabled={pushPermission !== 'granted'}
          >
            <span className="pwa-action-icon">📨</span>
            <span>测试通知</span>
          </button>
        </div>
      </div>

      <div className="pwa-tips">
        <h3>使用提示</h3>
        <ul>
          <li>✅ 离线时仍可查看球员数据和比赛记录</li>
          <li>✅ 添加到主屏幕可获得更好的体验</li>
          <li>✅ 启用推送通知获取实时更新</li>
          <li>✅ 定期清除缓存可释放存储空间</li>
        </ul>
      </div>
    </div>
  );
};

export default PwaManager;