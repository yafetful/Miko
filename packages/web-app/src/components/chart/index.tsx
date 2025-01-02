import React, { forwardRef } from 'react';
import LineChart from './LineChart';
import { useChartData } from '../../hooks/useChartData';

interface ChartProps {
  data?: any;
  type?: 'line' | 'bar' | 'pie';
  width?: number | string;
  height?: number | string;
}

export const Chart = forwardRef<any, ChartProps>((props, ref) => {
  const { type = 'line', ...rest } = props;
  const { data, loading, error } = useChartData();
  console.log(data);

  const renderChart = () => {
    switch (type) {
      case 'line':
        return <LineChart ref={ref} {...rest} data={data} />;
      default:
        return <div>no cart</div>;
    }
  };

  return renderChart();
});

export default Chart; 