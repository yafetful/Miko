import { useState, useEffect } from 'react';
import { lunarCrushService, TimeSeriesData } from 'shared';

interface UseChartDataProps {
  symbol?: string;
  interval?: string;
}

interface CacheData {
  data: TimeSeriesData[];
  timestamp: number;
}

const CACHE_KEY_PREFIX = 'chart_cache_';
const CACHE_EXPIRY_TIME = 60 * 60 * 1000;

export const useChartData = ({ symbol = 'bitcoin', interval = '1d' }: UseChartDataProps = {}) => {
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [data, setData] = useState<TimeSeriesData[]>([]);

  const getCacheKey = (symbol: string, interval: string) => 
    `${CACHE_KEY_PREFIX}${symbol}-${interval}`;

  const getFromCache = (key: string): CacheData | null => {
    try {
      const cached = localStorage.getItem(key);
      return cached ? JSON.parse(cached) : null;
    } catch {
      return null;
    }
  };

  const setToCache = (key: string, data: TimeSeriesData[], timestamp = Date.now()) => {
    try {
      localStorage.setItem(key, JSON.stringify({ data, timestamp }));
    } catch (e) {
      console.error('缓存存储失败:', e);
    }
  };

  const isDataStale = (timestamp: number) => {
    return Date.now() - timestamp > CACHE_EXPIRY_TIME;
  };

  const fetchData = async () => {
    const cacheKey = getCacheKey(symbol, interval);
    const cachedData = getFromCache(cacheKey);

    if (cachedData && !isDataStale(cachedData.timestamp)) {
      console.log('使用缓存数据:', cacheKey);
      setData(cachedData.data);
      setLoading(false);
      return;
    }

    try {
      setLoading(true);
      const response = await lunarCrushService.getTokenTimeSeries(symbol, interval);
      if (response.error) {
        setError(response.error);
      } else {
        console.log('更新缓存:', cacheKey);
        setToCache(cacheKey, response.data);
        setData(response.data);
      }
    } catch (err) {
      setError('获取数据失败');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, [symbol, interval]);

  return {
    data,
    loading,
    error,
    refetch: fetchData
  };
}; 