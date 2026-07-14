/**
 * 微信JS-SDK分享组件
 * 功能：分享到朋友圈、好友、QQ、微博等
 * 集成点：球员卡片、比赛结果、排行榜、阵容等关键页面
 */

import React, { useEffect, useState, useCallback } from 'react';

// 微信JS-SDK签名配置（生产环境应从后端API获取）
const WECHAT_CONFIG = {
  appId: 'YOUR_WECHAT_APP_ID',        // 替换为实际AppID
  jsApiList: [
    'updateAppMessageShareData',      // 分享给朋友
    'updateTimelineShareData',        // 分享到朋友圈
    'onMenuShareTimeline',            // 旧版分享到朋友圈
    'onMenuShareAppMessage',          // 旧版分享给朋友
    'onMenuShareQQ',                  // 分享到QQ
    'onMenuShareQZone',               // 分享到QQ空间
    'onMenuShareWeibo',               // 分享到微博
    'chooseImage',                    // 选择图片
    'previewImage',                   // 预览图片
    'uploadImage',                    // 上传图片
    'downloadImage',                  // 下载图片
    'getNetworkType',                 // 获取网络类型
    'openLocation',                   // 打开位置
    'getLocation',                    // 获取位置
    'hideOptionMenu',                 // 隐藏菜单
    'showOptionMenu',                 // 显示菜单
    'hideMenuItems',                  // 隐藏菜单项
    'showMenuItems',                  // 显示菜单项
    'hideAllNonBaseMenuItem',         // 隐藏所有非基础菜单项
    'showAllNonBaseMenuItem',         // 显示所有非基础菜单项
    'closeWindow',                    // 关闭窗口
    'scanQRCode',                     // 扫描二维码
    'addCard',                        // 添加卡券
    'chooseCard',                     // 选择卡券
    'openCard'                        // 打开卡券
  ],
  debug: false, // 生产环境设为false
  openTagList: [] // 开放标签列表
};

const WechatShare = ({ 
  title = '江特FC - 足球球队官网',
  desc = '',
  link = window.location.href,
  imgUrl = '/icons/icon-512x512.png',
  shareContent = {},
  type = 'player', // player | match | lineup | ranking | general
  onShareSuccess,
  onShareCancel,
  onShareFail
}) => {
  const [isConfigured, setIsConfigured] = useState(false);
  const [isWxEnvironment, setIsWxEnvironment] = useState(false);
  const [shareLoading, setShareLoading] = useState(false);
  const [shareError, setShareError] = useState('');

  // 检测微信环境
  useEffect(() => {
    const ua = navigator.userAgent.toLowerCase();
    const isWx = ua.includes('micromessenger');
    setIsWxEnvironment(isWx);
    
    if (isWx && window.wx) {
      initWxConfig();
    }
  }, []);

  // 初始化微信SDK配置
  const initWxConfig = async () => {
    try {
      setShareLoading(true);
      
      // 获取签名（应从后端API获取）
      const signature = await fetchWxSignature();
      
      if (signature) {
        window.wx.config({
          debug: WECHAT_CONFIG.debug,
          appId: signature.appId,
          timestamp: signature.timestamp,
          nonceStr: signature.nonceStr,
          signature: signature.signature,
          jsApiList: WECHAT_CONFIG.jsApiList,
          openTagList: WECHAT_CONFIG.openTagList
        });

        window.wx.ready(() => {
          console.log('微信JS-SDK初始化成功');
          setIsConfigured(true);
          setShareLoading(false);
          setupShareMenu();
        });

        window.wx.error((res) => {
          console.error('微信JS-SDK初始化失败:', res);
          setShareError('微信SDK初始化失败: ' + (res.errMsg || '未知错误'));
          setShareLoading(false);
        });
      }
    } catch (error) {
      console.error('微信配置失败:', error);
      setShareError('配置失败: ' + error.message);
      setShareLoading(false);
    }
  };

  // 获取微信签名（模拟，实际应从后端API获取）
  const fetchWxSignature = async () => {
    // 实际环境应向服务器请求签名
    // const response = await fetch('/api/wx-signature?url=' + encodeURIComponent(window.location.href));
    // const data = await response.json();
    // return data;
    
    // 模拟返回
    return {
      appId: WECHAT_CONFIG.appId,
      timestamp: Math.floor(Date.now() / 1000).toString(),
      nonceStr: Math.random().toString(36).substr(2, 15),
      signature: 'MOCK_SIGNATURE', // 模拟签名
    };
  };

  // 设置分享菜单
  const setupShareMenu = () => {
    if (!window.wx) return;

    const shareData = buildShareData();

    // 新版分享API
    if (window.wx.updateAppMessageShareData) {
      window.wx.updateAppMessageShareData({
        title: shareData.title,
        desc: shareData.desc,
        link: shareData.link,
        imgUrl: shareData.imgUrl,
        success: () => {
          console.log('分享给朋友设置成功');
          onShareSuccess?.();
        },
        cancel: onShareCancel
      });
    }

    if (window.wx.updateTimelineShareData) {
      window.wx.updateTimelineShareData({
        title: shareData.timelineTitle || shareData.title,
        link: shareData.link,
        imgUrl: shareData.imgUrl,
        success: () => {
          console.log('分享到朋友圈设置成功');
          onShareSuccess?.();
        },
        cancel: onShareCancel
      });
    }

    // 旧版分享API（兼容微信6.x版本）
    window.wx.onMenuShareAppMessage({
      title: shareData.title,
      desc: shareData.desc,
      link: shareData.link,
      imgUrl: shareData.imgUrl,
      type: 'link',
      dataUrl: '',
      success: () => {
        console.log('分享给朋友成功');
        onShareSuccess?.();
      },
      cancel: onShareCancel
    });

    window.wx.onMenuShareTimeline({
      title: shareData.timelineTitle || shareData.title,
      link: shareData.link,
      imgUrl: shareData.imgUrl,
      success: () => {
        console.log('分享到朋友圈成功');
        onShareSuccess?.();
      },
      cancel: onShareCancel
    });

    // QQ分享
    window.wx.onMenuShareQQ?.({
      title: shareData.title,
      desc: shareData.desc,
      link: shareData.link,
      imgUrl: shareData.imgUrl,
      success: () => console.log('分享到QQ成功'),
      cancel: onShareCancel
    });

    // QQ空间分享
    window.wx.onMenuShareQZone?.({
      title: shareData.title,
      desc: shareData.desc,
      link: shareData.link,
      imgUrl: shareData.imgUrl,
      success: () => console.log('分享到QQ空间成功'),
      cancel: onShareCancel
    });

    // 微博分享
    window.wx.onMenuShareWeibo?.({
      title: shareData.title,
      desc: shareData.desc,
      link: shareData.link,
      imgUrl: shareData.imgUrl,
      success: () => console.log('分享到微博成功'),
      cancel: onShareCancel
    });
  };

  // 构建分享数据
  const buildShareData = useCallback(() => {
    let shareTitle = title;
    let shareDesc = desc;
    let shareImg = imgUrl;

    // 根据分享类型构建不同的分享内容
    switch (type) {
      case 'player':
        shareTitle = shareContent.playerName
          ? `${shareContent.playerName} - 球员档案`
          : '球员档案分享';
        shareDesc = shareContent.playerStats 
          ? `${shareContent.playerStats} | 查看完整档案`
          : '查看球员资料和比赛记录';
        shareImg = shareContent.playerPhoto || '/icons/player-share.png';
        break;

      case 'match':
        shareTitle = shareContent.matchInfo 
          ? `${shareContent.matchInfo}` 
          : '比赛结果分享';
        shareDesc = shareContent.score 
          ? `比分: ${shareContent.score} | 最佳球员: ${shareContent.bestPlayer || '-'}`
          : '查看比赛详细数据';
        shareImg = '/icons/match-share.png';
        break;

      case 'lineup':
        shareTitle = '最佳阵容推荐';
        shareDesc = shareContent.lineupInfo || '查看球队最佳阵容配置';
        shareImg = '/icons/lineup-share.png';
        break;

      case 'ranking':
        shareTitle = '球队排行榜';
        shareDesc = shareContent.rankingInfo || '查看球员数据排行榜';
        shareImg = '/icons/ranking-share.png';
        break;

      case 'general':
      default:
        shareTitle = shareContent.title || title;
        shareDesc = shareContent.desc || desc;
        shareImg = shareContent.imgUrl || imgUrl;
        break;
    }

    return {
      title: shareTitle,
      desc: shareDesc,
      link: link,
      imgUrl: shareImg,
      timelineTitle: shareContent.timelineTitle || `${shareTitle} | 江特FC`
    };
  }, [title, desc, link, imgUrl, shareContent, type]);

  // 自定义分享（Web端非微信环境）
  const handleShare = async (platform) => {
    setShareLoading(true);
    const shareData = buildShareData();

    try {
      if (navigator.share) {
        // 使用Web Share API
        await navigator.share({
          title: shareData.title,
          text: shareData.desc,
          url: shareData.link
        });
        onShareSuccess?.();
      } else {
        // 降级到复制链接
        await navigator.clipboard.writeText(
          `${shareData.title}\n${shareData.desc}\n${shareData.link}`
        );
        alert(`分享链接已复制到剪贴板！${platform ? '\n平台: ' + platform : ''}`);
      }
    } catch (error) {
      if (error.name !== 'AbortError') {
        console.error('分享失败:', error);
        setShareError('分享失败: ' + error.message);
        onShareFail?.(error);
        
        // 备用方案：复制链接
        try {
          await navigator.clipboard.writeText(
            `${shareData.title}\n${shareData.desc}\n${shareData.link}`
          );
          alert('分享失败，但链接已复制到剪贴板');
        } catch (clipError) {
          alert('分享失败，请手动复制链接');
        }
      }
    } finally {
      setShareLoading(false);
    }
  };

  // 生成二维码分享
  const generateQRCode = () => {
    // 使用qrcode库生成二维码
    // 实际实现需要引入qrcode库
    console.log('生成二维码:', link);
    alert('二维码分享功能开发中...');
  };

  // 微信客服消息分享
  const shareToCustomerService = () => {
    if (window.wx && isWxEnvironment) {
      window.wx.openCustomerServiceChat?.({
        corpId: 'YOUR_CORP_ID', // 企业微信corpId
        url: link
      });
    }
  };

  // 微信小程序分享
  const shareToMiniProgram = () => {
    if (window.wx && isWxEnvironment) {
      window.wx.miniProgram?.getEnv?.(res => {
        if (res.miniprogram) {
          window.wx.miniProgram?.navigateTo?.({
            url: `/pages/share/index?url=${encodeURIComponent(link)}`
          });
        }
      });
    }
  };

  // 更新分享内容
  useEffect(() => {
    if (isConfigured && isWxEnvironment) {
      setupShareMenu();
    }
  }, [title, desc, link, imgUrl, shareContent, type]);

  return (
    <div className="wechat-share-container">
      {/* 微信环境中的分享按钮 */}
      {isWxEnvironment && isConfigured && (
        <div className="wx-share-hint">
          <span className="wx-hint-icon">↗️</span>
          <span>点击右上角 ··· 分享</span>
        </div>
      )}

      {/* Web环境中的分享按钮 */}
      {!isWxEnvironment && (
        <div className="share-buttons">
          <button 
            className="share-btn wechat-btn"
            onClick={() => handleShare('微信')}
            disabled={shareLoading}
            title="复制分享链接到微信"
          >
            <span className="share-icon">💬</span>
            <span className="share-text">微信分享</span>
          </button>

          <button 
            className="share-btn friend-btn"
            onClick={() => handleShare('朋友圈')}
            disabled={shareLoading}
            title="复制分享链接到朋友圈"
          >
            <span className="share-icon">🔄</span>
            <span className="share-text">分享朋友圈</span>
          </button>

          <button 
            className="share-btn qq-btn"
            onClick={() => handleShare('QQ')}
            disabled={shareLoading}
            title="分享到QQ"
          >
            <span className="share-icon">🐧</span>
            <span className="share-text">分享QQ</span>
          </button>

          <button 
            className="share-btn copy-btn"
            onClick={() => handleShare('链接')}
            disabled={shareLoading}
            title="复制分享链接"
          >
            <span className="share-icon">📋</span>
            <span className="share-text">复制链接</span>
          </button>

          <button 
            className="share-btn qrcode-btn"
            onClick={generateQRCode}
            disabled={shareLoading}
            title="生成二维码"
          >
            <span className="share-icon">📱</span>
            <span className="share-text">二维码</span>
          </button>
        </div>
      )}

      {/* 微信环境SDK初始化中 */}
      {isWxEnvironment && !isConfigured && (
        <div className="wx-loading">
          <span>微信SDK初始化中...</span>
        </div>
      )}

      {/* 分享错误提示 */}
      {shareError && (
        <div className="share-error-tip">
          <span>{shareError}</span>
          <button 
            className="retry-btn"
            onClick={() => {
              setShareError('');
              initWxConfig();
            }}
          >
            重试
          </button>
        </div>
      )}

      {/* 分享成功提示 */}
      {onShareSuccess && (
        <div className="share-success-tip" style={{ display: shareError ? 'none' : 'block' }}>
          分享成功！感谢您的支持！
        </div>
      )}
    </div>
  );
};

// 微信分享按钮组件（用于页面嵌入）
export const WechatShareButton = ({ 
  title, 
  desc, 
  link, 
  imgUrl, 
  shareType = 'general',
  buttonText = '分享',
  buttonStyle = {}
}) => {
  const [showOptions, setShowOptions] = useState(false);

  return (
    <div className="wechat-share-button-wrapper">
      <button 
        className="share-trigger-btn"
        style={buttonStyle}
        onClick={() => setShowOptions(!showOptions)}
      >
        <span className="share-btn-icon">↗️</span>
        {buttonText}
      </button>

      {showOptions && (
        <div className="share-dropdown">
          <div className="share-dropdown-header">
            <h4>分享到</h4>
            <button 
              className="share-close-btn"
              onClick={() => setShowOptions(false)}
            >
              ×
            </button>
          </div>
          <div className="share-dropdown-content">
            <WechatShare
              title={title}
              desc={desc}
              link={link}
              imgUrl={imgUrl}
              type={shareType}
            />
          </div>
        </div>
      )}
    </div>
  );
};

export default WechatShare;
