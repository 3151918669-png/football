import React, { useState, useEffect } from 'react';
import './PwaInstallPrompt.css';

const PwaInstallPrompt = () => {
  const [deferredPrompt, setDeferredPrompt] = useState(null);
  const [isInstallable, setIsInstallable] = useState(false);
  const [isInstalled, setIsInstalled] = useState(false);
  const [isDismissed, setIsDismissed] = useState(false);
  const [showPrompt, setShowPrompt] = useState(false);

  useEffect(() => {
    // 检查是否已安装
    const isStandalone = window.matchMedia('(display-mode: standalone)').matches;
    setIsInstalled(isStandalone);

    // 检查localStorage中是否已关闭提示
    const dismissed = localStorage.getItem('pwa-prompt-dismissed');
    setIsDismissed(dismissed === 'true');

    // 监听beforeinstallprompt事件
    const handleBeforeInstallPrompt = (e) => {
      e.preventDefault();
      setDeferredPrompt(e);
      setIsInstallable(true);
      
      // 如果未安装且未关闭提示，显示安装提示
      if (!isStandalone && !dismissed) {
        setTimeout(() => {
          setShowPrompt(true);
        }, 3000); // 延迟3秒显示
      }
    };

    // 监听appinstalled事件
    const handleAppInstalled = () => {
      setIsInstalled(true);
      setIsInstallable(false);
      setShowPrompt(false);
      console.log('PWA 已安装');
    };

    window.addEventListener('beforeinstallprompt', handleBeforeInstallPrompt);
    window.addEventListener('appinstalled', handleAppInstalled);

    return () => {
      window.removeEventListener('beforeinstallprompt', handleBeforeInstallPrompt);
      window.removeEventListener('appinstalled', handleAppInstalled);
    };
  }, []);

  const handleInstall = async () => {
    if (!deferredPrompt) return;

    try {
      deferredPrompt.prompt();
      const { outcome } = await deferredPrompt.userChoice;
      
      console.log(`用户安装结果: ${outcome}`);
      setDeferredPrompt(null);
      setIsInstallable(false);
      
      if (outcome === 'accepted') {
        setIsInstalled(true);
        setShowPrompt(false);
      }
    } catch (error) {
      console.error('安装失败:', error);
    }
  };

  const handleDismiss = () => {
    setShowPrompt(false);
    setIsDismissed(true);
    localStorage.setItem('pwa-prompt-dismissed', 'true');
  };

  const handleLater = () => {
    setShowPrompt(false);
    // 1小时后再次显示
    setTimeout(() => {
      if (!isInstalled && !isDismissed) {
        setShowPrompt(true);
      }
    }, 3600000); // 1小时
  };

  // 如果已安装或不应显示提示，则不渲染
  if (isInstalled || !showPrompt || isDismissed) {
    return null;
  }

  return (
    <div className="pwa-install-prompt-overlay">
      <div className="pwa-install-prompt">
        <div className="pwa-prompt-header">
          <div className="pwa-prompt-icon">
            <span role="img" aria-label="app">📱</span>
          </div>
          <div className="pwa-prompt-title">
            <h3>安装城市猎人FC应用</h3>
            <p>获得更好的体验，支持离线使用</p>
          </div>
          <button className="pwa-close-btn" onClick={handleDismiss} aria-label="关闭">
            ×
          </button>
        </div>

        <div className="pwa-prompt-features">
          <div className="pwa-feature">
            <span className="pwa-feature-icon" role="img" aria-label="offline">📶</span>
            <div>
              <strong>离线访问</strong>
              <small>无网络时查看球员数据和比赛记录</small>
            </div>
          </div>
          <div className="pwa-feature">
            <span className="pwa-feature-icon" role="img" aria-label="fast">⚡</span>
            <div>
              <strong>快速加载</strong>
              <small>像原生应用一样快速启动</small>
            </div>
          </div>
          <div className="pwa-feature">
            <span className="pwa-feature-icon" role="img" aria-label="notification">🔔</span>
            <div>
              <strong>实时通知</strong>
              <small>获取比赛更新和重要消息</small>
            </div>
          </div>
          <div className="pwa-feature">
            <span className="pwa-feature-icon" role="img" aria-label="home">🏠</span>
            <div>
              <strong>主屏幕访问</strong>
              <small>直接从主屏幕启动应用</small>
            </div>
          </div>
        </div>

        <div className="pwa-prompt-actions">
          <button className="pwa-secondary-btn" onClick={handleLater}>
            稍后提醒
          </button>
          <button className="pwa-primary-btn" onClick={handleInstall}>
            添加到主屏幕
          </button>
        </div>

        <div className="pwa-prompt-footer">
          <small>
            安装后，您可以在主屏幕找到应用图标，享受更好的球队管理体验。
          </small>
        </div>
      </div>
    </div>
  );
};

export default PwaInstallPrompt;