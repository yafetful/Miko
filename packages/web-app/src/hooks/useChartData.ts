import { useState, useEffect } from 'react';
import { lunarCrushService, TimeSeriesData } from 'shared';

export const useChartData = () => {
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [data, setData] = useState<TimeSeriesData[]>([]);

  const fetchData = async () => {
    try {
      setLoading(true);
      const response = await lunarCrushService.getBitcoinTimeSeries();
      if (response.error) {
        setError(response.error);
      } else {
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
  }, []);

  return {
    data,
    loading,
    error,
    refetch: fetchData
  };
}; 