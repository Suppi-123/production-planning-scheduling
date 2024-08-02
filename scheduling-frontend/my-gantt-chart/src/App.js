import React, { useState } from 'react';
import Header from '../src/components/Header'; // Adjust the path if needed
import Sidebar from '../src/components/Sidebar';
import GanttChart from '../src/components/GanttChartComponent';
import AddTaskForm from '../src/components/AddTaskForm';
import DailyProduction from '../src/components/DailyProduction'; // Import DailyProduction component

const App = () => {
  const [view, setView] = useState('gantt');

  const renderContent = () => {
    switch (view) {
      case 'gantt':
        return <GanttChart />;
      case 'addTask':
        return <AddTaskForm />;
      case 'scheduleDetails':
        return <div>Schedule Details</div>;
      case 'dailyProduction':
        return <DailyProduction />;
      default:
        return <GanttChart />;
    }
  };

  return (
    <div>
      <Header />
      <div style={{ display: 'flex' }}>
        <Sidebar setView={setView} />
        <div style={{ marginLeft: '250px', marginTop: '60px', padding: '20px', width: 'calc(100% - 250px)' }}>
          {renderContent()}
        </div>
      </div>
    </div>
  );
};

export default App;
