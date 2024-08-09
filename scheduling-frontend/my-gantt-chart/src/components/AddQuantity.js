import React, { useState, useEffect } from 'react';
import axios from 'axios';

const AddQuantity = () => {
  const [components, setComponents] = useState([]);
  const [quantity, setQuantity] = useState(0);
  const [selectedComponent, setSelectedComponent] = useState('');
  const [fetchedQuantities, setFetchedQuantities] = useState([]);

  useEffect(() => {
    fetchComponents();
  }, []);

  const fetchComponents = async () => {
    try {
      const response = await axios.get('http://172.18.101.47:4567/fetch_operations/');
      const data = response.data;

      // Assuming data is an array of objects with component details
      const componentList = data.map(item => item.component);
      setComponents(componentList);
      setFetchedQuantities(data);
    } catch (error) {
      console.error('Error fetching components:', error);
    }
  };

  const handleComponentChange = (e) => {
    setSelectedComponent(e.target.value);
  };

  const handleQuantityChange = (e) => {
    setQuantity(e.target.value);
  };

  const handleAddQuantity = async () => {
    if (!selectedComponent || quantity <= 0) {
      alert('Please select a component and enter a valid quantity.');
      return;
    }

    try {
      await axios.post('http://172.18.101.47:4567/insert_component_quantities/', [
        {
          component: selectedComponent,
          quantity: parseInt(quantity, 10),
        }
      ]);
      alert('Quantity added successfully!');
      setQuantity(0);
      fetchComponents();  // Refresh the list of components
    } catch (error) {
      console.error('Error adding quantity:', error);
      alert('Failed to add quantity.');
    }
  };

  return (
    <div className="container mx-auto p-4">
      <h1 className="text-2xl font-bold mb-4">Add Quantity</h1>
      <div className="space-y-4">
        <div>
          <label className="block mb-2 font-bold">Component:</label>
          <select
            value={selectedComponent}
            onChange={handleComponentChange}
            className="w-full p-2 border rounded"
          >
            <option value="">Select Component</option>
            {components.map((component, index) => (
              <option key={index} value={component}>{component}</option>
            ))}
          </select>
        </div>
        
        <div>
          <label className="block mb-2 font-bold">Quantity:</label>
          <input
            type="number"
            value={quantity}
            onChange={handleQuantityChange}
            className="w-full p-2 border rounded"
          />
        </div>
        
        <button
          onClick={handleAddQuantity}
          className="px-4 py-2 bg-blue-500 text-white rounded hover:bg-blue-600"
        >
          Add Quantity
        </button>
      </div>
      
      {/* <div className="mt-8">
        <h2 className="text-xl font-bold mb-4">Fetched Quantities</h2>
        <ul>
          {fetchedQuantities.length > 0 ? (
            fetchedQuantities.map((item, index) => (
              <li key={index} className="mb-2">
                {item.component}: {item.description} ({item.type} on {item.machine}) - From {new Date(item.start_time).toLocaleString()} to {new Date(item.end_time).toLocaleString()}
              </li>
            ))
          ) : (
            <li>No quantities available</li>
          )}
        </ul>
      </div> */}
    </div>
  );
};

export default AddQuantity;
