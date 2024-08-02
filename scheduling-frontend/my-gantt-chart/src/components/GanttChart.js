import React, { useEffect, useState } from 'react';
import axios from 'axios';
import { Chart } from 'react-google-charts';

const GanttChart = () => {
  const [data, setData] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    axios.get('http://172.18.101.47:1234/schedule/')
      .then(response => {
        const fetchedData = response.data.map((item, index) => [
          `Task ${index + 1}`,     // Task ID
          item.description,        // Task Name
          item.machine,            // Resource
          new Date(item.start_time), // Start Date
          new Date(item.end_time),   // End Date
          null,                    // Duration (in milliseconds)
          100,                     // Percent Complete
          null                     // Dependencies
        ]);

        setData([
          [
            { type: 'string', label: 'Task ID' },
            { type: 'string', label: 'Task Name' },
            { type: 'string', label: 'Resource' },
            { type: 'date', label: 'Start Date' },
            { type: 'date', label: 'End Date' },
            { type: 'number', label: 'Duration' },
            { type: 'number', label: 'Percent Complete' },
            { type: 'string', label: 'Dependencies' },
          ],
          ...fetchedData
        ]);

        setIsLoading(false);
      })
      .catch(error => {
        console.error('Error fetching data:', error);
        setError(error);
        setIsLoading(false);
      });
  }, []);

  if (isLoading) {
    return <div>Loading...</div>;
  }

  if (error) {
    return <div>Error: {error.message}</div>;
  }

  return (
    <Chart
      width={'100%'}
      height={'400px'}
      chartType="Gantt"
      loader={<div>Loading Chart...</div>}
      data={data}
      options={{
        height: 400,
        gantt: {
          trackHeight: 30,
        },
      }}
    />
  );
};

export default GanttChart;
