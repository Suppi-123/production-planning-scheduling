import React, { useState, useEffect } from 'react';

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
    fetch('http://172.18.101.47:4567/daily_production/')
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

  const renderBarChart = () => {
    if (!data) {
      return null;
    }

    const chartData = [];
    const allDates = new Set();

    Object.keys(data.daily_production).forEach((component) => {
      const componentData = data.daily_production[component];
      Object.keys(componentData).forEach((date) => {
        allDates.add(date);
        chartData.push({
          component,
          date,
          quantity: componentData[date],
        });
      });
    });

    const sortedDates = Array.from(allDates).sort();

    const groupedData = sortedDates.map((date) => {
      const dateData = chartData.filter((d) => d.date === date);
      return {
        date,
        components: dateData,
      };
    });

    return (
      <div className="flex flex-col items-center">
        {groupedData.map(({ date, components }) => (
          <div key={date} className="mb-4 w-full">
            <div className="font-bold mb-2">{date}</div>
            <div className="flex items-end h-52">
              {components.map(({ component, quantity }) => (
                <div
                  key={component}
                  className="flex-1 h-full mx-2 flex items-end justify-center text-white"
                  style={{
                    height: `${quantity * 10}px`,
                    backgroundColor: `hsl(${(component.length * 50) % 360}, 70%, 50%)`,
                  }}
                  title={`Component: ${component}\nQuantity: ${quantity}`}
                >
                  {quantity}
                </div>
              ))}
            </div>
          </div>
        ))}
      </div>
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
      <table className="mt-6 w-full border border-gray-300">
        <thead>
          <tr className="bg-gray-100">
            <th className="p-2 border-b">Component</th>
            <th className="p-2 border-b">Date</th>
            <th className="p-2 border-b">Quantity</th>
          </tr>
        </thead>
        <tbody>
          {getPaginatedData().map(({ component, date, quantity }) => (
            <tr key={`${component}-${date}`}>
              <td className="p-2 border-b">{component}</td>
              <td className="p-2 border-b">{date}</td>
              <td className="p-2 border-b">{quantity}</td>
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
