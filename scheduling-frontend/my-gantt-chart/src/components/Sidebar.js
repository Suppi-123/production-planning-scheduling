// src/components/Sidebar.js
import React, { useState } from 'react';

const Sidebar = ({ setView }) => {
  const [hoveredItem, setHoveredItem] = useState(null);
  const [selectedItem, setSelectedItem] = useState(null);

  const handleItemClick = (view) => {
    setView(view);
    setSelectedItem(view);
  };

  return (
    <div style={styles.sidebar}>
      <ul style={styles.navList}>
        <li
          onClick={() => handleItemClick('gantt')}
          onMouseEnter={() => setHoveredItem('gantt')}
          onMouseLeave={() => setHoveredItem(null)}
          style={(hoveredItem === 'gantt' || selectedItem === 'gantt') ? { ...styles.navItem, ...styles.navItemHover } : styles.navItem}
        >
          Gantt Chart
        </li>
        <li
          onClick={() => handleItemClick('scheduleDetails')}
          onMouseEnter={() => setHoveredItem('scheduleDetails')}
          onMouseLeave={() => setHoveredItem(null)}
          style={(hoveredItem === 'scheduleDetails' || selectedItem === 'scheduleDetails') ? { ...styles.navItem, ...styles.navItemHover } : styles.navItem}
        >
          Schedule Details
        </li>
        <li
          onClick={() => handleItemClick('dailyProduction')}
          onMouseEnter={() => setHoveredItem('dailyProduction')}
          onMouseLeave={() => setHoveredItem(null)}
          style={(hoveredItem === 'dailyProduction' || selectedItem === 'dailyProduction') ? { ...styles.navItem, ...styles.navItemHover } : styles.navItem}
        >
          Daily Production
        </li>
        <li
          onClick={() => handleItemClick('addTask')}
          onMouseEnter={() => setHoveredItem('addTask')}
          onMouseLeave={() => setHoveredItem(null)}
          style={(hoveredItem === 'addTask' || selectedItem === 'addTask') ? { ...styles.navItem, ...styles.navItemHover } : styles.navItem}
        >
          Add Task
        </li>
        <li
          onClick={() => handleItemClick('addQuantity')} // Add new menu item
          onMouseEnter={() => setHoveredItem('addQuantity')}
          onMouseLeave={() => setHoveredItem(null)}
          style={(hoveredItem === 'addQuantity' || selectedItem === 'addQuantity') ? { ...styles.navItem, ...styles.navItemHover } : styles.navItem}
        >
          Add Quantity
        </li>
        <li
          onClick={() => handleItemClick('leadTime')} // Add new menu item for Lead Time
          onMouseEnter={() => setHoveredItem('leadTime')}
          onMouseLeave={() => setHoveredItem(null)}
          style={(hoveredItem === 'leadTime' || selectedItem === 'leadTime') ? { ...styles.navItem, ...styles.navItemHover } : styles.navItem}
        >
          Lead Time
        </li>
        <li
          onClick={() => handleItemClick('maintenance')} // Add new menu item for Maintenance
          onMouseEnter={() => setHoveredItem('maintenance')}
          onMouseLeave={() => setHoveredItem(null)}
          style={(hoveredItem === 'maintenance' || selectedItem === 'maintenance') ? { ...styles.navItem, ...styles.navItemHover } : styles.navItem}
        >
          Maintenance
        </li>
      </ul>
    </div>
  );
};

const styles = {
  sidebar: {
    width: '250px',
    height: 'calc(100vh - 60px)', // Adjust height to account for header
    position: 'fixed',
    top: '60px', // Adjust top to align with header
    left: 0,
    backgroundColor: '#2F323B', // Updated background color
    padding: '20px',
    boxShadow: '2px 0 5px rgba(0,0,0,0.1)',
  },
  navList: {
    listStyleType: 'none',
    padding: 0,
  },
  navItem: {
    padding: '10px',
    cursor: 'pointer',
    marginBottom: '10px',
    borderRadius: '4px',
    transition: 'background-color 0.3s, color 0.3s', // Transition for both color and background-color
    color: 'white', // Set text color to white
    backgroundColor: 'transparent', // Default background color
  },
  navItemHover: {
    backgroundColor: '#3598DB', // Hover background color
  },
};

export default Sidebar;
