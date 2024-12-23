import { copyFile, writeFile, mkdir, cp } from 'fs/promises';
import { fileURLToPath } from 'url';
import { dirname, resolve } from 'path';
import { existsSync } from 'fs';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

async function copyFiles() {
  const distDir = resolve(__dirname, '../dist');
  const assetsDir = resolve(distDir, 'assets');

  // 确保目录存在
  if (!existsSync(distDir)) {
    await mkdir(distDir);
  }
  if (!existsSync(assetsDir)) {
    await mkdir(assetsDir);
  }

  // 复制 manifest.json
  await copyFile(
    resolve(__dirname, '../public/manifest.json'),
    resolve(distDir, 'manifest.json')
  );

  // 复制图标和资源文件（如果存在）
  const publicAssetsDir = resolve(__dirname, '../public/assets');
  if (existsSync(publicAssetsDir)) {
    await cp(publicAssetsDir, assetsDir, { recursive: true });
  }

  // 创建 background.js
  const backgroundContent = `
    chrome.sidePanel
      .setPanelBehavior({ openPanelOnActionClick: true })
      .catch((error) => console.error(error));
      
    chrome.runtime.onInstalled.addListener(() => {
      console.log('Extension installed');
    });
  `;
  await writeFile(resolve(distDir, 'background.js'), backgroundContent);

  // 创建 content.js
  const contentContent = `console.log('Content script loaded');`;
  await writeFile(resolve(distDir, 'content.js'), contentContent);

  // 创建 content.css
  const contentCss = `/* 在这里添加注入页面的样式 */`;
  await writeFile(resolve(distDir, 'content.css'), contentCss);

  // 重命名和移动 HTML 文件
  await copyFile(
    resolve(distDir, 'src/popup/index.html'),
    resolve(distDir, 'sidepanel.html')
  ).catch(async () => {
    await copyFile(
      resolve(distDir, 'popup/index.html'),
      resolve(distDir, 'sidepanel.html')
    );
  });
}

copyFiles().catch(error => {
  console.error('Build error:', error);
  process.exit(1);
}); 