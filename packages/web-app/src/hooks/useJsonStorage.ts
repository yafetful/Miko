import { useCallback } from 'react';
import { JsonPackage } from '../contexts/JsonCollectorContext';

const JSON_PACKAGES_KEY = 'json_packages';

export const useJsonStorage = () => {
  // 保存所有包
  const savePackages = useCallback((packages: JsonPackage[]) => {
    try {
      localStorage.setItem(JSON_PACKAGES_KEY, JSON.stringify(packages));
    } catch (error) {
      console.error('Failed to save JSON packages:', error);
    }
  }, []);

  // 获取所有包
  const loadPackages = useCallback((): JsonPackage[] => {
    try {
      const stored = localStorage.getItem(JSON_PACKAGES_KEY);
      return stored ? JSON.parse(stored) : [];
    } catch (error) {
      console.error('Failed to load JSON packages:', error);
      return [];
    }
  }, []);

  // 清除所有包
  const clearPackages = useCallback(() => {
    try {
      localStorage.removeItem(JSON_PACKAGES_KEY);
    } catch (error) {
      console.error('Failed to clear JSON packages:', error);
    }
  }, []);

  // 添加按名称删除包的方法
  const deletePackageByName = useCallback((name: string) => {
    try {
      const packages = loadPackages();
      const filteredPackages = packages.filter(pkg => pkg.name !== name);
      savePackages(filteredPackages);
    } catch (error) {
      console.error('Failed to delete package by name:', error);
    }
  }, [loadPackages, savePackages]);

  return {
    savePackages,
    loadPackages,
    clearPackages,
    deletePackageByName,
  };
}; 