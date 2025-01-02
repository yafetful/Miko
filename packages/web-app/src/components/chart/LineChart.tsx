import React, { useEffect, useRef, forwardRef } from 'react';
import * as echarts from 'echarts';
import type { EChartsOption } from 'echarts';

interface LineChartProps {
  data: Array<{
    posts_created: number;
    posts_active: number;
    contributors_created: number;
    contributors_active: number;
    interactions: number;
    time: number;
  }>;
  height?: string | number;
  width?: string | number;
  onHoverIndexChange?: (index: number) => void;
}

export const LineChart = forwardRef<any, LineChartProps>((props, ref) => {
  const {
    data,
    height = '400px',
    width = '100%',
    onHoverIndexChange
  } = props;
  const chartRef = useRef<HTMLDivElement>(null);
  const chartInstance = useRef<echarts.ECharts>();

  useEffect(() => {
    if (chartRef.current) {
      chartInstance.current = echarts.init(chartRef.current);
    }

    const metrics = [
      { name: 'posts_created', color: '#FF6B6B' },
      { name: 'posts_active', color: '#4ECDC4' },
      { name: 'contributors_created', color: '#45B7D1' },
      { name: 'contributors_active', color: '#96CEB4' },
      { name: 'interactions', color: '#FFD93D' }
    ];

    // 数据归一化处理函数
    const normalize = (values: number[]) => {
      const max = Math.max(...values);
      const min = Math.min(...values);
      return values.map(v => ((v - min) / (max - min)) * 100);
    };

    // 对每个指标进行归一化处理
    const normalizedData = data.map((item) => {
      const normalized: Record<string, number> = { ...item };
      metrics.forEach(metric => {
        const values = data.map(d => d[metric.name as keyof typeof d]);
        const normalizedValues = normalize(values);
        const index = data.indexOf(item);
        normalized[metric.name] = normalizedValues[index];
      });
      return normalized;
    });

    const seriesList: echarts.SeriesOption[] = metrics.map(metric => ({
      name: metric.name,
      type: 'line',
      showSymbol: false,
      smooth: true,
      itemStyle: {
        color: metric.color
      },
      emphasis: {
        focus: 'series'
      },
      encode: {
        x: 'time',
        y: metric.name
      }
    }));

    const option: EChartsOption = {
      animationDuration: 5000,
      dataset: {
        source: normalizedData
      },
      title: {
        text: 'Bitcoin社交数据趋势',
        left: 'center'
      },
      tooltip: {
        trigger: 'axis',
        formatter: function (params: any) {
          const dataIndex = Math.min(params[0].dataIndex, data.length - 1);
          let result = `${new Date(params[0].value.time * 1000).toLocaleString()}<br/>`;
          params.forEach((param: any) => {
            const originalValue = data[dataIndex][param.seriesName as keyof typeof data[0]];
            result += `${param.seriesName}: ${originalValue} <br/>`;
          });
          return result;
        },
      },
      legend: {
        data: metrics.map(m => m.name),
        type: 'scroll',
        orient: 'horizontal',
        top: 25,
        textStyle: {
          fontSize: 12
        }
      },
      grid: {
        left: '0',
        right: '0',
        bottom: '10%',
        top: '15%',
        containLabel: true
      },
      dataZoom: [{
        type: 'slider',
        show: false,
        start: 0,
        end: 100,
        xAxisIndex: [0]
      }],
      xAxis: {
        type: 'time',
        axisLabel: {
          formatter: (value: number) => {
            const date = new Date(value * 1000);
            return `${date.getMonth() + 1}/${date.getDate()} ${date.getHours()}:00`;
          },
          margin: 32,
          color: '#999'
        },
        splitLine: {
          show: false
        },
        axisLine: {
          show: false
        },
        axisTick: {
          show: false
        },
        min: 'dataMin',
        max: 'dataMax'
      },
      yAxis: {
        type: 'value',
        scale: true,
        axisLabel: {
          show: false
        },
        splitLine: {
          show: false
        },
        max: 100,
        min: 0
      },
      series: seriesList
    };

    chartInstance.current?.setOption(option);

    const handleResize = () => {
      chartInstance.current?.resize();
    };
    window.addEventListener('resize', handleResize);

    // 添加这个函数来更新显示的数据点
    const updateDataPoint = (index: number) => {
      const safeIndex = Math.min(Math.max(0, index), data.length - 1);
      const dataPoint = normalizedData[safeIndex];
      if (dataPoint) {
        chartInstance.current?.dispatchAction({
          type: 'showTip',
          seriesIndex: 0,
          dataIndex: safeIndex
        });
      }
    };

    // 将方法暴露到传入的ref上
    if (ref) {
      (ref as any).current = {
        updateDataPoint
      };
    }

    return () => {
      chartInstance.current?.dispose();
      window.removeEventListener('resize', handleResize);
    };
  }, [data, ref]);  // 添加ref到依赖数组

  return (
    <div 
      ref={chartRef} 
      style={{ 
        width, 
        height,
      }} 
    />
  );
});

export default LineChart; 