import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { ToastContainer, toast } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';

const AddQuantity = () => {
  const [components, setComponents] = useState([]);
  const [quantity, setQuantity] = useState(0);
  const [selectedComponent, setSelectedComponent] = useState('');
  const [fetchedQuantities, setFetchedQuantities] = useState([]);
  const [dueDate, setDueDate] = useState('');

  useEffect(() => {
    fetchComponents();
  }, []);

  const fetchComponents = async () => {
    try {
      const response = await axios.get('http://172.18.101.47:4567/fetch_operations/');
      const data = response.data;

      // Extract component names and remove duplicates using Set
      const componentList = [...new Set(data.map(item => item.component))];
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

  const handleDueDateChange = (e) => {
    setDueDate(e.target.value);
  };

  const handleAddQuantity = async () => {
    if (!selectedComponent || quantity <= 0) {
      toast.error('Please select a component and enter a valid quantity.');
      return;
    }

    try {
      await axios.post('http://172.18.101.47:4567/insert_component_quantities/', [
        {
          component: selectedComponent,
          quantity: parseInt(quantity, 10),
        }
      ]);
      toast.success('Quantity added successfully!');
      setQuantity(0);
      fetchComponents();  // Refresh the list of components
    } catch (error) {
      console.error('Error adding quantity:', error);
      toast.error('Failed to add quantity.');
    }
  };

  const handleAddDueDate = async () => {
    if (!selectedComponent || !dueDate) {
      toast.error('Please select a component and enter a due date.');
      return;
    }

    try {
      await axios.post('http://172.18.101.47:4567/insert_lead_times/', [
        {
          component: selectedComponent,
          due_date: dueDate,
        }
      ]);
      toast.success('Due Date added successfully!');
      setDueDate('');
    } catch (error) {
      console.error('Error adding due date:', error);
      toast.error('Failed to add due date.');
    }
  };

  return (
    <div className="container mx-auto p-4">
      <ToastContainer />

      {/* Flex Container for Aligning Cards Side by Side */}
      <div className="flex flex-wrap gap-4">
        
        {/* Add Quantity Card */}
        <div className="flex-1 bg-white shadow-md rounded-lg p-6 border border-gray-200">
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
        </div>

        {/* Add Due Date Card */}
        <div className="flex-1 bg-white shadow-md rounded-lg p-6 border border-gray-200">
          <h1 className="text-2xl font-bold mb-4">Add Due Date</h1>
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
              <label className="block mb-2 font-bold">Due Date:</label>
              <input
                type="datetime-local"  // Allows setting both date and time
                value={dueDate}
                onChange={handleDueDateChange}
                className="w-full p-2 border rounded"
              />
            </div>

            <button
              onClick={handleAddDueDate}
              className="px-4 py-2 bg-green-500 text-white rounded hover:bg-green-600"
            >
              Submit
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default AddQuantity;
