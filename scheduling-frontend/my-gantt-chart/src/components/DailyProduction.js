import React, { useState, useEffect } from 'react';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';

// Function to generate a random color
const getRandomColor = () => {
  const letters = '0123456789ABCDEF';
  let color = '#';
  for (let i = 0; i < 6; i++) {
    color += letters[Math.floor(Math.random() * 16)];
  }
  return color;
};

const DailyProduction = () => {
  const [data, setData] = useState(null);
  const [additionalData, setAdditionalData] = useState({
    overall_end_time: '',
    overall_time: '',
    total_components: 0,
  });
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 10;

  useEffect(() => {
    fetch('http://172.18.7.85:4567/daily_production/')
      .then((response) => response.json())
      .then((data) => {
        setData(data);
        setAdditionalData({
          overall_end_time: data.overall_end_time,
          overall_time: data.overall_time,
          total_components: data.total_components,
        });
      })
      .catch((error) => console.error('Error fetching data:', error));
  }, []);

  const prepareChartData = () => {
    if (!data) return [];

    const chartData = [];
    const allDates = new Set();

    Object.values(data.daily_production).forEach(componentData => {
      Object.keys(componentData).forEach(date => allDates.add(date));
    });

    const sortedDates = Array.from(allDates).sort();

    sortedDates.forEach(date => {
      const dateData = { date };
      Object.entries(data.daily_production).forEach(([component, componentData]) => {
        if (componentData[date]) {
          dateData[component] = componentData[date]; // Store individual component data
        }
      });
      chartData.push(dateData);
    });

    return chartData;
  };

  const CustomTooltip = ({ active, payload, label }) => {
    if (active && payload && payload.length) {
      return (
        <div className="bg-white p-4 border rounded shadow">
          <p className="font-bold">{`Date: ${label}`}</p>
          {payload.map((entry, index) => (
            <div key={`item-${index}`} className="flex justify-between">
              <span style={{ color: entry.color }}>{entry.name}:</span>
              <span>{entry.value}</span>
            </div>
          ))}
        </div>
      );
    }
    return null;
  };

  const renderBarChart = () => {
    const chartData = prepareChartData();
    const componentKeys = data ? Object.keys(data.daily_production) : [];

    return (
      <ResponsiveContainer width="100%" height={400}>
        <BarChart data={chartData}>
          <CartesianGrid strokeDasharray="3 3" />
          <XAxis dataKey="date" />
          <YAxis />
          <Tooltip content={<CustomTooltip />} />
          {componentKeys.map((component, index) => (
            <Bar
              key={component}
              dataKey={component}
              fill={getRandomColor()} // Assign a random color to each component
              stackId="a"
            />
          ))}
        </BarChart>
      </ResponsiveContainer>
    );
  };

  const handlePageChange = (direction) => {
    setCurrentPage((prevPage) => Math.max(1, prevPage + direction));
  };

  const getPaginatedData = () => {
    if (!data) return [];

    const allRows = [];
    Object.keys(data.daily_production).forEach((component) =>
      Object.keys(data.daily_production[component]).forEach((date) => {
        allRows.push({
          component,
          date,
          quantity: data.daily_production[component][date],
        });
      })
    );

    // Sort allRows by date
    allRows.sort((a, b) => new Date(a.date) - new Date(b.date));

    const startIndex = (currentPage - 1) * itemsPerPage;
    const endIndex = startIndex + itemsPerPage;
    return allRows.slice(startIndex, endIndex);
  };

  const totalPages = () => {
    if (!data) return 1;

    const totalItems = Object.keys(data.daily_production).reduce(
      (acc, component) => acc + Object.keys(data.daily_production[component]).length,
      0
    );

    return Math.ceil(totalItems / itemsPerPage);
  };

  if (!data) {
    return <div>Loading...</div>;
  }

  return (
    <div className="p-6">
      <h2 className="text-2xl font-semibold mb-6">Daily Production</h2>
      <div className="flex space-x-4 mb-6">
        <div className="flex-1 p-4 bg-blue-200 rounded shadow-md">
          <p className="text-lg font-medium">Overall End Time</p>
          <p className="text-xl font-bold">{additionalData.overall_end_time}</p>
        </div>
        <div className="flex-1 p-4 bg-green-200 rounded shadow-md">
          <p className="text-lg font-medium">Overall Time</p>
          <p className="text-xl font-bold">{additionalData.overall_time}</p>
        </div>
        <div className="flex-1 p-4 bg-yellow-200 rounded shadow-md">
          <p className="text-lg font-medium">Total Components</p>
          <p className="text-xl font-bold">{additionalData.total_components}</p>
        </div>
      </div>
      {renderBarChart()}
      <h3 className="text-xl font-semibold mt-6">Daily Production Details</h3>
      <table className="mt-6 w-full border-collapse border border-gray-500 table-auto">
        <thead>
          <tr className="bg-gray-100">
            <th className="p-2 border border-gray-500">Component</th>
            <th className="p-2 border border-gray-500">Date</th>
            <th className="p-2 border border-gray-500">Quantity</th>
          </tr>
        </thead>
        <tbody>
          {getPaginatedData().map(({ component, date, quantity }) => (
            <tr key={`${component}-${date}`} className="border border-gray-500">
              <td className="p-2 border border-gray-500">{component}</td>
              <td className="p-2 border border-gray-500">{date}</td>
              <td className="p-2 border border-gray-500">{quantity}</td>
            </tr>
          ))}
        </tbody>
      </table>
      <div className="flex justify-between mt-4">
        <button
          onClick={() => handlePageChange(-1)}
          disabled={currentPage === 1}
          className="px-4 py-2 bg-gray-300 rounded"
        >
          Previous
        </button>
        <span>
          Page {currentPage} of {totalPages()}
        </span>
        <button
          onClick={() => handlePageChange(1)}
          disabled={currentPage === totalPages()}
          className="px-4 py-2 bg-gray-300 rounded"
        >
          Next
        </button>
      </div>
    </div>
  );
};

export default DailyProduction;
