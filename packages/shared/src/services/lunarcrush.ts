import axios from 'axios';

export interface TimeSeriesData {
  posts_created: number;
  posts_active: number;
  contributors_created: number;
  contributors_active: number;
  interactions: number;
  time: number;
}

interface ApiResponse {
  data: TimeSeriesData[];
  status: number;
  error?: string;
}

interface LunarCrushResponse {
  data: Array<{
    posts_created: number;
    posts_active: number;
    contributors_created: number;
    contributors_active: number;
    interactions: number;
    time: number;
  }>;
}

class LunarCrushService {
  private readonly BASE_URL = 'https://lunarcrush.com/api4/public';
  private readonly API_KEY = 'm39kaa2cgwo2v73g6v7h9bpwem589p2l9lj6ptl';

  private async request<T>(endpoint: string): Promise<T> {
    try {
      const response = await axios({
        url: `${this.BASE_URL}${endpoint}`,
        headers: {
          'Authorization': `Bearer ${this.API_KEY}`,
        },
      });
      return response.data as T;
    } catch (error) {
      console.error('API请求失败:', error);
      throw error;
    }
  }

  async getBitcoinTimeSeries(interval: string = '1d'): Promise<ApiResponse> {
    try {
      const response = await this.request<LunarCrushResponse>(`/topic/bitcoin/time-series/v1?interval=${interval}`);
      return {
        data: response.data.map((item: any) => ({
          posts_created: item.posts_created || 0,
          posts_active: item.posts_active || 0,
          contributors_created: item.contributors_created || 0,
          contributors_active: item.contributors_active || 0,
          interactions: item.interactions || 0,
          time: item.time
        })),
        status: 200
      };
    } catch (error) {
      return {
        data: [],
        status: 500,
        error: '获取数据失败'
      };
    }
  }
}

export const lunarCrushService = new LunarCrushService(); 