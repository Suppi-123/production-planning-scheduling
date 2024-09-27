import React, { useState, useEffect } from 'react';
import ReactECharts from 'echarts-for-react';
import axios from 'axios';

const LeadTime = () => {
  const [data, setData] = useState([]);
  const [yAxisMin, setYAxisMin] = useState(null);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const response = await axios.get('http://172.18.7.85:4568/component_status/');
        const formattedData = [
          ...response.data.early_complete,
          ...response.data.delayed_complete
        ].map(item => ({
          component: item.component,
          leadTime: new Date(item.lead_time).getTime(),
          scheduledEndTime: new Date(item.scheduled_end_time).getTime(),
          onTime: item.on_time
        }));
        setData(formattedData);
        
        // Calculate the minimum date and set the yAxisMin
        const minDate = Math.min(...formattedData.map(item => Math.min(item.leadTime, item.scheduledEndTime)));
        const oneDayBefore = minDate - 24 * 60 * 60 * 1000; // Subtract one day in milliseconds
        setYAxisMin(oneDayBefore);
      } catch (error) {
        console.error('Error fetching data:', error);
      }
    };

    fetchData();
  }, []);

  const getOption = () => {
    const components = data.map(item => item.component);
    const leadTimes = data.map(item => item.leadTime);
    const scheduledEndTimes = data.map(item => item.scheduledEndTime);
    const onTimeStatus = data.map(item => item.onTime ? 'Yes' : 'No');

    return {
      title: {
        text: 'Lead Time and Scheduled End Time graph'
      },
      tooltip: {
        trigger: 'axis',
        formatter: function (params) {
          const component = params[0].axisValue;
          const scheduledEnd = new Date(params[0].data).toLocaleString();
          const leadTime = new Date(params[1].data).toLocaleString();
          const onTime = onTimeStatus[params[0].dataIndex];
          return `Component: ${component}<br/>Scheduled End Time: ${scheduledEnd}<br/>Lead Time: ${leadTime}<br/>On Time: ${onTime}`;
        }
      },
      legend: {
        data: ['Scheduled End Time', 'Lead Time']
      },
      grid: {
        left: '5%',
        right: '5%',
        bottom: '15%',
        containLabel: true
      },
      xAxis: {
        type: 'category',
        data: components,
        axisLabel: {
          interval: 0,
          rotate: 45,
          formatter: (value) => {
            return value.length > 15 ? value.substring(0, 15) + '...' : value;
          },
          textStyle: {
            fontSize: 10
          }
        }
      },
      yAxis: {
        type: 'time',
        min: yAxisMin,
        axisLabel: {
          formatter: (value) => new Date(value).toLocaleDateString()
        }
      },
      dataZoom: [
        {
          type: 'slider',
          show: true,
          xAxisIndex: [0],
          start: 0,
          end: 100
        },
        {
          type: 'inside',
          xAxisIndex: [0],
          start: 0,
          end: 100
        }
      ],
      color: ['#FF69B4', '#4169E1'], // Pink for bars, Blue for line
    series: [
        {
          name: 'Scheduled End Time',
          type: 'bar',
          data: scheduledEndTimes,
          itemStyle: {
            color: '#FF69B4' // Pink for bars
          }
        },
        {
          name: 'Lead Time',
          type: 'line',
          data: leadTimes,
          lineStyle: {
            color: '#4169E1' // Blue for line
          },
          itemStyle: {
            color: '#4169E1' // Blue for line points
          }
        }
      ]
    };
  };

  

  return (
    <div>
      
    
      <ReactECharts
        option={getOption()}
        style={{ height: '800px', width: '100%' }}
        opts={{ renderer: 'svg' }}
      />
    </div>
  );
};

export default LeadTime;