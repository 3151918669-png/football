// PWA图标生成脚本
// 运行: node generate-icons.js

const fs = require('fs');
const path = require('path');
const { createCanvas } = require('canvas');

// 图标配置
const iconSizes = [72, 96, 128, 144, 152, 192, 384, 512];
const iconDir = path.join(__dirname, 'icons');

// 确保图标目录存在
if (!fs.existsSync(iconDir)) {
  fs.mkdirSync(iconDir, { recursive: true });
}

// 主图标设计
function generateIcon(size) {
  const canvas = createCanvas(size, size);
  const ctx = canvas.getContext('2d');

  // 背景渐变
  const gradient = ctx.createLinearGradient(0, 0, size, size);
  gradient.addColorStop(0, '#07111f');
  gradient.addColorStop(0.5, '#101c2f');
  gradient.addColorStop(1, '#13233a');
  ctx.fillStyle = gradient;
  ctx.fillRect(0, 0, size, size);

  // 外框
  ctx.strokeStyle = 'rgba(215, 181, 109, 0.8)';
  ctx.lineWidth = size * 0.02;
  ctx.strokeRect(size * 0.1, size * 0.1, size * 0.8, size * 0.8);

  // 足球图案
  const centerX = size / 2;
  const centerY = size / 2;
  const radius = size * 0.3;

  // 足球主体
  ctx.fillStyle = '#f4f7fb';
  ctx.beginPath();
  ctx.arc(centerX, centerY, radius, 0, Math.PI * 2);
  ctx.fill();

  // 足球图案细节
  ctx.strokeStyle = '#07111f';
  ctx.lineWidth = size * 0.01;

  // 五边形图案
  const pentagonSize = radius * 0.5;
  drawPentagon(ctx, centerX, centerY, pentagonSize);

  // 六边形图案
  const hexagonSize = radius * 0.4;
  drawHexagon(ctx, centerX - radius * 0.6, centerY, hexagonSize);
  drawHexagon(ctx, centerX + radius * 0.6, centerY, hexagonSize);
  drawHexagon(ctx, centerX, centerY - radius * 0.6, hexagonSize);
  drawHexagon(ctx, centerX, centerY + radius * 0.6, hexagonSize);

  // 球队名称
  if (size >= 128) {
    ctx.fillStyle = '#d7b56d';
    ctx.font = `bold ${size * 0.08}px Arial`;
    ctx.textAlign = 'center';
    ctx.textBaseline = 'bottom';
    ctx.fillText('城市猎人FC', centerX, size * 0.9);
  }

  return canvas;
}

// 绘制五边形
function drawPentagon(ctx, x, y, size) {
  ctx.fillStyle = '#07111f';
  ctx.beginPath();
  for (let i = 0; i < 5; i++) {
    const angle = (Math.PI * 2 * i) / 5 - Math.PI / 2;
    const px = x + Math.cos(angle) * size;
    const py = y + Math.sin(angle) * size;
    if (i === 0) {
      ctx.moveTo(px, py);
    } else {
      ctx.lineTo(px, py);
    }
  }
  ctx.closePath();
  ctx.fill();
  ctx.stroke();
}

// 绘制六边形
function drawHexagon(ctx, x, y, size) {
  ctx.fillStyle = '#07111f';
  ctx.beginPath();
  for (let i = 0; i < 6; i++) {
    const angle = (Math.PI * 2 * i) / 6;
    const px = x + Math.cos(angle) * size;
    const py = y + Math.sin(angle) * size;
    if (i === 0) {
      ctx.moveTo(px, py);
    } else {
      ctx.lineTo(px, py);
    }
  }
  ctx.closePath();
  ctx.fill();
  ctx.stroke();
}

// 生成所有尺寸的图标
console.log('开始生成PWA图标...');

iconSizes.forEach(size => {
  const canvas = generateIcon(size);
  const buffer = canvas.toBuffer('image/png');
  const filename = `icon-${size}x${size}.png`;
  const filepath = path.join(iconDir, filename);
  
  fs.writeFileSync(filepath, buffer);
  console.log(`✓ 生成图标: ${filename}`);
});

// 生成favicon
const faviconSizes = [16, 32, 48, 64];
faviconSizes.forEach(size => {
  const canvas = createCanvas(size, size);
  const ctx = canvas.getContext('2d');
  
  // 简单足球图标
  ctx.fillStyle = '#d7b56d';
  ctx.beginPath();
  ctx.arc(size/2, size/2, size/2 - 2, 0, Math.PI * 2);
  ctx.fill();
  
  ctx.fillStyle = '#07111f';
  ctx.beginPath();
  ctx.arc(size/2, size/2, size/3, 0, Math.PI * 2);
  ctx.fill();
  
  const buffer = canvas.toBuffer('image/png');
  const filename = `favicon-${size}x${size}.png`;
  const filepath = path.join(__dirname, filename);
  
  fs.writeFileSync(filepath, buffer);
  console.log(`✓ 生成favicon: ${filename}`);
});

// 生成ICO文件（通过外部工具）
console.log('\n图标生成完成！');
console.log('请将以下代码添加到HTML文件的<head>部分:');
console.log(`
<link rel="icon" href="/favicon-32x32.png" sizes="32x32">
<link rel="icon" href="/favicon-48x48.png" sizes="48x48">
<link rel="apple-touch-icon" href="/icons/icon-152x152.png">
<link rel="manifest" href="/manifest.json">
`);

// 创建README文件
const readmeContent = `# PWA图标使用说明

## 已生成的图标

### 主应用图标
- icon-72x72.png - 最小尺寸图标
- icon-96x96.png - 小尺寸图标
- icon-128x128.png - 中等尺寸图标
- icon-144x144.png - 中等尺寸图标
- icon-152x152.png - 苹果设备推荐尺寸
- icon-192x192.png - Android设备推荐尺寸
- icon-384x384.png - 大尺寸图标
- icon-512x512.png - 启动画面图标

### Favicon图标
- favicon-16x16.png - 浏览器标签页小图标
- favicon-32x32.png - 浏览器标签页标准图标
- favicon-48x48.png - 浏览器标签页大图标
- favicon-64x64.png - 备用图标

## 使用方法

1. 确保所有图标文件放置在项目根目录的 \`icons\` 文件夹中
2. 在HTML文件的 \`<head>\` 部分添加以下代码：

\`\`\`html
<link rel="icon" href="/favicon-32x32.png" sizes="32x32">
<link rel="icon" href="/favicon-48x48.png" sizes="48x48">
<link rel="apple-touch-icon" href="/icons/icon-152x152.png">
<link rel="manifest" href="/manifest.json">
\`\`\`

3. 确保 \`manifest.json\` 文件中的图标路径正确

## 重新生成图标

如需重新生成图标，运行：
\`\`\`bash
node generate-icons.js
\`\`\`

## 注意事项

- 图标使用球队主题色（深蓝背景 + 金色边框）
- 足球图案设计符合体育应用风格
- 所有图标均为PNG格式，支持透明度
- 建议定期更新图标以保持新鲜感

## 浏览器支持

- Chrome/Edge: 完全支持
- Firefox: 完全支持
- Safari: 需要152x152尺寸图标
- 移动浏览器: 支持添加到主屏幕功能
`;

fs.writeFileSync(path.join(__dirname, 'PWA-ICONS-README.md'), readmeContent);
console.log('\n已生成README文件: PWA-ICONS-README.md');
console.log('PWA图标生成完成！');