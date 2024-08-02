import React, { useState, useEffect } from 'react';

const DailyProduction = () => {
  const [data, setData] = useState(null);

  useEffect(() => {
    fetch('http://172.18.101.47:4567/daily_production/')
      .then(response => response.json())
      .then(data => setData(data))
      .catch(error => console.error('Error fetching data:', error));
  }, []);

  const renderBarChart = () => {
    if (!data) {
      return null;
    }

    const chartData = [];
    const allDates = new Set();

    Object.keys(data.daily_production).forEach(component => {
      const componentData = data.daily_production[component];
      Object.keys(componentData).forEach(date => {
        allDates.add(date);
        chartData.push({
          component,
          date,
          quantity: componentData[date],
        });
      });
    });

    const sortedDates = Array.from(allDates).sort();

    const groupedData = sortedDates.map(date => {
      const dateData = chartData.filter(d => d.date === date);
      return {
        date,
        components: dateData,
      };
    });

    return (
      <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
        {groupedData.map(({ date, components }) => (
          <div key={date} style={{ marginBottom: '10px', width: '100%' }}>
            <div style={{ fontWeight: 'bold', marginBottom: '5px' }}>{date}</div>
            <div style={{ display: 'flex', alignItems: 'flex-end', height: '200px' }}>
              {components.map(({ component, quantity }) => (
                <div
                  key={component}
                  style={{
                    flex: 1,
                    height: `${quantity * 10}px`,
                    backgroundColor: `hsl(${(component.length * 50) % 360}, 70%, 50%)`,
                    margin: '0 5px',
                    display: 'flex',
                    alignItems: 'flex-end',
                    justifyContent: 'center',
                    color: 'white',
                  }}
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

  if (!data) {
    return <div>Loading...</div>;
  }

  return (
    <div>
      <h2>Daily Production</h2>
      {renderBarChart()}
      <h3>Daily Production Details</h3>
      <table border="1" style={{ marginTop: '20px', width: '100%' }}>
        <thead>
          <tr>
            <th>Component</th>
            <th>Date</th>
            <th>Quantity</th>
          </tr>
        </thead>
        <tbody>
          {Object.keys(data.daily_production).map(component => (
            Object.keys(data.daily_production[component]).map(date => (
              <tr key={`${component}-${date}`}>
                <td>{component}</td>
                <td>{date}</td>
                <td>{data.daily_production[component][date]}</td>
              </tr>
            ))
          ))}
        </tbody>
      </table>
    </div>
  );
};

export default DailyProduction;
