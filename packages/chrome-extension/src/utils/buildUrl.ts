/**
 * 构建资源URL，确保在不同环境下都能正确加载资源
 * 在开发环境和生产环境中都能正常工作
 */
export function buildUrl(path: string): string {
  // 在 Chrome 扩展中使用 chrome.runtime.getURL
  return chrome.runtime.getURL(path);
}

// 如果需要处理不同类型的资源，可以添加具体的工具函数
export function getAssetUrl(path: string): string {
  return chrome.runtime.getURL(`assets/${path}`);
}

export function getModelUrl(path: string): string {
  return chrome.runtime.getURL(`models/${path}`);
}
