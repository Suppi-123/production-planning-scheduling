// src/App.js
import React, { useState } from 'react';
import Header from './components/Header';
import Sidebar from './components/Sidebar';
import GanttChart from './components/GanttChartComponent';
import AddTask from './components/AddTask';
import DailyProduction from './components/DailyProduction';
import ScheduleDetails from './components/ScheduleDetails';
import AddQuantity from './components/AddQuantity'; // Import AddQuantity component

const App = () => {
  const [view, setView] = useState('gantt');

  const renderContent = () => {
    switch (view) {
      case 'gantt':
        return <GanttChart />;
      case 'addTask':
        return <AddTask />;
      case 'scheduleDetails':
        return <ScheduleDetails />;
      case 'dailyProduction':
        return <DailyProduction />;
      case 'addQuantity': // Add case for AddQuantity
        return <AddQuantity />;
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
