import React from 'react';

const Header = () => {
  return (
    <div style={styles.header}>
      <h1>Production Planning and Scheduling</h1>
    </div>
  );
};

const styles = {
  header: {
    width: '100%',
    height: '60px',
    backgroundColor: '#232429', // Updated background color
    color: 'white',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    boxShadow: '0 2px 4px rgba(0,0,0,0.1)',
    position: 'fixed', // Fix the header at the top
    top: 0, // Align to the top
    left: 0,
    zIndex: 1000, // Ensure it stays above other content
  },
};

export default Header;
