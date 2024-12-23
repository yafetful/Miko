// 创建一个简单的资源路径处理函数
export function buildAssetUrl(path: string): string {
  // 确保路径以 / 开头
  const normalizedPath = path.startsWith('/') ? path : `/${path}`;
  
  // 在开发环境中
  if (import.meta.env.DEV) {
    return normalizedPath;
  }
  
  // 在生产环境中，可能需要添加基础路径
  const basePath = import.meta.env.BASE_URL || '';
  return `${basePath}${normalizedPath}`;
} 