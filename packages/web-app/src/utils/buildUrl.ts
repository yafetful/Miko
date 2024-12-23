/**
 * 构建资源URL，确保在不同环境下都能正确加载资源
 * 在开发环境和生产环境中都能正常工作
 */
export function buildUrl(path: string): string {
  // 确保路径以 / 开头
  const normalizedPath = path.startsWith('/') ? path : `/${path}`;
  
  // 在开发环境中直接使用路径
  if (import.meta.env.DEV) {
    return normalizedPath;
  }
  
  // 在生产环境中添加基础路径
  const base = import.meta.env.VITE_BASE_URL || '';
  const fullPath = `${base}${normalizedPath}`;
  return fullPath;
}
