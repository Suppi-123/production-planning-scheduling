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
  const [viewData, setViewData] = useState([]); // New state for view data
  const [showTable, setShowTable] = useState(false); // New state to toggle table visibility
  const [dueDateData, setDueDateData] = useState([]); // New state for due date data
  const [showDueDateTable, setShowDueDateTable] = useState(false); // New state to toggle due date table visibility

  useEffect(() => {
    fetchComponents();
  }, []);

  const fetchComponents = async () => {
    try {
      const response = await axios.get('http://172.18.7.85:5609/fetch_operations/');
      const data = response.data;

      const componentList = [...new Set(data.map(item => item.component))];
      setComponents(componentList);
      setFetchedQuantities(data);
    } catch (error) {
      console.error('Error fetching components:', error);
    }
  };

  const fetchComponentQuantities = async () => {
    if (!selectedComponent) {
      toast.error('Please select a component to view its quantities.');
      return;
    }
    try {
      const response = await axios.get('http://172.18.7.85:5609/fetch_component_quantities/');
      if (typeof response.data === 'object') {
        const filteredData = Object.entries(response.data)
          .filter(([component]) => component === selectedComponent)
          .map(([component, quantity]) => ({ component, quantity }));
        setViewData(filteredData);
      } else {
        toast.error('Unexpected data format received.');
      }
      setShowTable(true);
    } catch (error) {
      console.error('Error fetching component quantities:', error);
    }
  };

  // New function to fetch due dates
 // New function to fetch due dates
const fetchDueDates = async () => {
  if (!selectedComponent) {
    toast.error('Please select a component to view its due dates.');
    return;
  }
  try {
    const response = await axios.get('http://172.18.7.85:5609/lead-time-table');
    const filteredData = response.data.filter(item => item.component === selectedComponent);
    setDueDateData(filteredData);
    setShowDueDateTable(true); // Show the due date table after fetching data
  } catch (error) {
    console.error('Error fetching due dates:', error);
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
      await axios.post('http://172.18.7.85:5609/insert_component_quantities/', [
        {
          component: selectedComponent,
          quantity: parseInt(quantity, 10),
        }
      ]);
      toast.success('Quantity added successfully!');
      setQuantity(0);
      fetchComponents();
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
      await axios.post('http://172.18.7.85:5609/insert_lead_times/', [
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

      <div className="flex flex-wrap gap-4">
        
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

            {/* New View Button for Component Quantities */}
            <button
              onClick={fetchComponentQuantities}
              className="px-4 py-2 bg-yellow-500 text-white rounded hover:bg-yellow-600"
            >
              View Quantities
            </button>
          </div>
        </div>

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
                type="datetime-local"
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

            {/* New View Button for Due Dates */}
            <button
              onClick={fetchDueDates}
              className="px-4 py-2 bg-orange-500 text-white rounded hover:bg-orange-600"
            >
              View Due Dates
            </button>
          </div>
        </div>
      </div>

     {/* Conditional Rendering of the Component Quantities and Due Dates Tables */}
     <div className="flex space-x-4 mt-4">
        {showTable && (
          <div className="flex-1 bg-white shadow-md rounded-lg p-6 border border-gray-200">
            <h2 className="text-xl font-bold mb-4">Component Quantities</h2>
            <table className="min-w-full border-collapse border border-gray-200">
              <thead>
                <tr>
                  <th className="border border-gray-300 p-2">Component</th>
                  <th className="border border-gray-300 p-2">Quantity</th>
                </tr>
              </thead>
              <tbody>
                {viewData.map((item, index) => (
                  <tr key={index} className="hover:bg-gray-100 cursor-pointer">
                    <td className="border border-gray-300 p-2">{item.component}</td>
                    <td className="border border-gray-300 p-2">{item.quantity}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}

{showDueDateTable && (
          <div className="flex-1 bg-white shadow-md rounded-lg p-6 border border-gray-200">
            <h2 className="text-xl font-bold mb-4">Due Dates</h2>
            <table className="min-w-full border-collapse border border-gray-200">
              <thead>
                <tr>
                  <th className="border border-gray-300 p-2">Component</th>
                  <th className="border border-gray-300 p-2">Due Date</th>
                </tr>
              </thead>
              <tbody>
                {dueDateData.map((item, index) => (
                  <tr key={index} className="hover:bg-gray-100 cursor-pointer">
                    <td className="border border-gray-300 p-2">{item.component}</td>
                    <td className="border border-gray-300 p-2">{item.due_date}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
};

export default AddQuantity;