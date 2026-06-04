/**
 * 微信JS-SDK签名API模拟
 * 生产环境需要部署到服务器
 */

// 模拟微信签名生成
const generateWxSignature = (url) => {
  const timestamp = Math.floor(Date.now() / 1000).toString();
  const nonceStr = Math.random().toString(36).substr(2, 15);
  
  // 模拟签名算法（实际需要使用微信提供的算法）
  const signature = `MOCK_SIGNATURE_${timestamp}_${nonceStr}_${url.replace(/[^a-zA-Z0-9]/g, '')}`;
  
  return {
    appId: 'YOUR_WECHAT_APP_ID',
    timestamp,
    nonceStr,
    signature,
    url
  };
};

// API处理函数
export default function handler(req, res) {
  if (req.method !== 'GET') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  try {
    const { url } = req.query;
    
    if (!url) {
      return res.status(400).json({ error: 'Missing url parameter' });
    }

    // 验证URL格式
    const urlPattern = /^https?:\/\/[^\s$.?#].[^\s]*$/;
    if (!urlPattern.test(url)) {
      return res.status(400).json({ error: 'Invalid URL format' });
    }

    // 生成签名
    const signature = generateWxSignature(url);

    // 返回签名数据
    res.status(200).json({
      success: true,
      data: signature,
      timestamp: Date.now()
    });

  } catch (error) {
    console.error('微信签名生成失败:', error);
    res.status(500).json({ 
      success: false, 
      error: 'Internal server error',
      message: error.message 
    });
  }
}

// 微信分享配置验证
export const validateWxConfig = (config) => {
  const requiredFields = ['appId', 'timestamp', 'nonceStr', 'signature'];
  const missingFields = requiredFields.filter(field => !config[field]);
  
  if (missingFields.length > 0) {
    throw new Error(`Missing required fields: ${missingFields.join(', ')}`);
  }

  // 验证时间戳（10分钟内有效）
  const timestamp = parseInt(config.timestamp);
  const now = Math.floor(Date.now() / 1000);
  if (Math.abs(now - timestamp) > 600) {
    throw new Error('Signature expired');
  }

  return true;
};

// 微信分享数据验证
export const validateShareData = (data) => {
  const { title, desc, link, imgUrl } = data;
  
  if (!title || title.length > 100) {
    throw new Error('Title is required and must be less than 100 characters');
  }
  
  if (!desc || desc.length > 200) {
    throw new Error('Description is required and must be less than 200 characters');
  }
  
  if (!link || !link.startsWith('http')) {
    throw new Error('Valid URL is required');
  }
  
  if (!imgUrl || !imgUrl.startsWith('http')) {
    throw new Error('Valid image URL is required');
  }

  return true;
};

// 微信分享统计
export const trackShareEvent = (event) => {
  const { type, platform, content, userId, timestamp } = event;
  
  console.log('分享事件:', {
    type,
    platform,
    content,
    userId,
    timestamp: new Date(timestamp).toISOString()
  });

  // 这里可以记录到数据库或分析平台
  return {
    success: true,
    eventId: `share_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`
  };
};

// 微信分享API文档
export const API_DOCS = {
  GET: {
    '/api/wx-signature': {
      description: '获取微信JS-SDK签名',
      parameters: {
        url: '当前页面的完整URL（需要encodeURIComponent）'
      },
      response: {
        success: 'boolean',
        data: {
          appId: 'string',
          timestamp: 'string',
          nonceStr: 'string',
          signature: 'string'
        }
      }
    }
  },
  POST: {
    '/api/share/track': {
      description: '记录分享事件',
      body: {
        type: 'player | match | lineup | ranking',
        platform: 'wechat | friend | qq | weibo',
        content: 'object (分享内容)',
        userId: 'string (可选)'
      },
      response: {
        success: 'boolean',
        eventId: 'string'
      }
    }
  }
};

// 使用示例
/*
// 前端调用示例
fetch(`/api/wx-signature?url=${encodeURIComponent(window.location.href)}`)
  .then(res => res.json())
  .then(data => {
    if (data.success) {
      wx.config({
        debug: false,
        appId: data.data.appId,
        timestamp: data.data.timestamp,
        nonceStr: data.data.nonceStr,
        signature: data.data.signature,
        jsApiList: ['updateAppMessageShareData', 'updateTimelineShareData']
      });
    }
  });

// 记录分享事件
fetch('/api/share/track', {
  method: 'POST',
  headers: { 'Content-Type': 'application/json' },
  body: JSON.stringify({
    type: 'player',
    platform: 'wechat',
    content: { playerId: '123', playerName: '张三' },
    userId: 'user_123'
  })
});
*/