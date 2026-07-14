// PWA Service Worker 注册和服务管理组件
import React, { useState, useEffect } from 'react';

const PwaRegister = () => {
  const [deferredPrompt, setDeferredPrompt] = useState(null);
  const [isInstallable, setIsInstallable] = useState(false);
  const [isInstalled, setIsInstalled] = useState(false);
  const [registration, setRegistration] = useState(null);
  const [pushPermission, setPushPermission] = useState('default');

  useEffect(() => {
    // 检测是否已安装PWA
    if (window.matchMedia('(display-mode: standalone)').matches) {
      setIsInstalled(true);
    }

    // 注册Service Worker
    if ('serviceWorker' in navigator) {
      navigator.serviceWorker.register('/service-worker.js')
        .then(reg => {
          console.log('Service Worker 注册成功:', reg.scope);
          setRegistration(reg);
          
          // 检查推送通知权限
          if ('Notification' in window) {
            setPushPermission(Notification.permission);
          }
        })
        .catch(error => {
          console.error('Service Worker 注册失败:', error);
        });
      
      // 监听Service Worker更新
      navigator.serviceWorker.addEventListener('controllerchange', () => {
        console.log('Service Worker 已更新');
        window.location.reload();
      });
    }

    // PWA安装提示
    window.addEventListener('beforeinstallprompt', (e) => {
      e.preventDefault();
      setDeferredPrompt(e);
      setIsInstallable(true);
    });

    // 应用安装完成
    window.addEventListener('appinstalled', () => {
      setIsInstalled(true);
      setIsInstallable(false);
      console.log('PWA 已安装');
    });
  }, []);

  // 安装PWA
  const installApp = async () => {
    if (!deferredPrompt) return;
    
    deferredPrompt.prompt();
    const { outcome } = await deferredPrompt.userChoice;
    
    console.log(`用户安装结果: ${outcome}`);
    setDeferredPrompt(null);
    setIsInstallable(false);
    
    if (outcome === 'accepted') {
      setIsInstalled(true);
    }
  };

  // 请求推送通知权限
  const requestPushPermission = async () => {
    if (!('Notification' in window)) {
      alert('浏览器不支持推送通知');
      return;
    }

    const permission = await Notification.requestPermission();
    setPushPermission(permission);
    
    if (permission === 'granted') {
      // 注册推送订阅
      if (registration) {
        try {
          const subscription = await registration.pushManager.subscribe({
            userVisibleOnly: true,
            applicationServerKey: urlBase64ToUint8Array(
              'YOUR_VAPID_PUBLIC_KEY' // 替换为实际的VAPID公钥
            )
          });
          
          console.log('推送订阅成功:', subscription);
          
          // 这里应该将订阅信息发送到服务器
          // await sendSubscriptionToServer(subscription);
        } catch (error) {
          console.error('推送订阅失败:', error);
        }
      }
    }
  };

  // 测试推送通知
  const testNotification = () => {
    if (!registration) return;
    
    const options = {
      body: '江特FC - 测试推送通知',
      icon: '/icons/icon-192x192.png',
      badge: '/icons/icon-72x72.png',
      vibrate: [200, 100, 200],
      tag: 'test-notification',
      data: {
        url: '/'
      }
    };
    
    registration.showNotification('测试通知', options);
  };

  // 手动触发后台同步
  const triggerBackgroundSync = async () => {
    if (!registration) return;
    
    try {
      if ('sync' in registration) {
        await registration.sync.register('sync-player-data');
        console.log('后台同步已注册');
      } else {
        console.log('后台同步不可用');
      }
    } catch (error) {
      console.error('后台同步注册失败:', error);
    }
  };

  // Base64转Uint8Array辅助函数
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

  return null; // 组件不渲染任何UI，仅处理Service Worker逻辑
};

export default PwaRegister;
