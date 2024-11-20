// AddTaskPage.js
import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { ToastContainer, toast } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';

const AddTaskPage =  ({ setView, setSelectedComponentData }) => {
  const [operations, setOperations] = useState([]);
  const [filteredOperations, setFilteredOperations] = useState([]);
  const [newOperation, setNewOperation] = useState({
    component: '',
    description: '',
    type: '',
    machine: '',
    time: 0,
  });
  const [components, setComponents] = useState([]);
  const [types, setTypes] = useState([]);
  const [machines, setMachines] = useState([]);
  const [customFields, setCustomFields] = useState({
    component: '',
    type: '',
    machine: '',
  });
  const [showCustomInput, setShowCustomInput] = useState({
    component: false,
    type: false,
    machine: false,
  });

  useEffect(() => {
    fetchOperations();
  }, []);

  const fetchOperations = async () => {
    try {
      const response = await axios.get('http://172.18.7.85:5601/fetch_operations/');
      setOperations(response.data);
      setComponents([...new Set(response.data.map(op => op.component)), 'Other']);
      setTypes([...new Set(response.data.map(op => op.type)), 'Other']);
      setMachines([...new Set(response.data.map(op => op.machine)), 'Other']);
    } catch (error) {
      console.error('Error fetching operations:', error);
    }
  };

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setNewOperation(prev => ({ ...prev, [name]: value }));
    
    if (value !== 'Other') {
      setCustomFields(prev => ({ ...prev, [name]: '' }));
      setShowCustomInput(prev => ({ ...prev, [name]: false }));
    } else {
      setShowCustomInput(prev => ({ ...prev, [name]: true }));
    }
  };

  const handleCustomInputChange = (e) => {
    const { name, value } = e.target;
    setCustomFields(prev => ({ ...prev, [name]: value }));
    setNewOperation(prev => ({ ...prev, [name]: value }));
  };

  const handleTimeChange = (amount) => {
    setNewOperation(prev => ({ ...prev, time: Math.max(0, prev.time + amount) }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    const operationToSubmit = {
      ...newOperation,
      component: newOperation.component === 'Other' ? customFields.component : newOperation.component,
      type: newOperation.type === 'Other' ? customFields.type : newOperation.type,
      machine: newOperation.machine === 'Other' ? customFields.machine : newOperation.machine,
    };

    try {
      const response = await axios.post('http://172.18.7.85:5601/post_operations/', {
        operations: [operationToSubmit],
      });

      if (response.data[0]?.message === "Operation already exists") {
        toast.error('Operation already exists');
      } else {
        toast.success('Operation added successfully!');
        toast.info('Add quantity and lead time for component to schedule.');
        // Set the selected component data before navigating
        setSelectedComponentData(operationToSubmit.component);
        setView('addQuantity');
      }
    } catch (error) {
      console.error('Error adding operation:', error);
      toast.error('Failed to add operation.');
    }
  };


  const handleViewClick = () => {
    const filtered = operations.filter(op => op.component === newOperation.component);
    setFilteredOperations(filtered);
  };

  return (
    <div className="container mx-auto p-4">
      <ToastContainer />
      <h1 className="text-2xl font-bold mb-4">Add New Operation</h1>
      <div className="max-w-full mx-auto bg-white shadow-lg rounded-lg p-6">
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="grid grid-cols-2 gap-4">
            {/* Row 1: Component and Type */}
            <div>
              <label className="block mb-2 font-bold">Component:</label>
              <select
                name="component"
                value={newOperation.component}
                onChange={handleInputChange}
                className="w-full p-2 border rounded"
              >
                <option value="">Select component</option>
                {components.map((item, index) => (
                  <option key={index} value={item}>{item}</option>
                ))}
              </select>
              {showCustomInput.component && (
                <div className="mt-2">
                  <input
                    type="text"
                    name="component"
                    placeholder="Enter new component"
                    value={customFields.component}
                    onChange={handleCustomInputChange}
                    className="w-full p-2 border rounded"
                  />
                </div>
              )}
            </div>

            <div>
              <label className="block mb-2 font-bold">Type:</label>
              <select
                name="type"
                value={newOperation.type}
                onChange={handleInputChange}
                className="w-full p-2 border rounded"
              >
                <option value="">Select type</option>
                {types.map((item, index) => (
                  <option key={index} value={item}>{item}</option>
                ))}
              </select>
              {showCustomInput.type && (
                <div className="mt-2">
                  <input
                    type="text"
                    name="type"
                    placeholder="Enter new type"
                    value={customFields.type}
                    onChange={handleCustomInputChange}
                    className="w-full p-2 border rounded"
                  />
                </div>
              )}
            </div>
          </div>

          {/* Row 2: Machine, Description, and Time */}
          <div className="grid grid-cols-1 gap-4">
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block mb-2 font-bold">Machine:</label>
                <select
                  name="machine"
                  value={newOperation.machine}
                  onChange={handleInputChange}
                  className="w-full p-2 border rounded"
                >
                  <option value="">Select machine</option>
                  {machines.map((item, index) => (
                    <option key={index} value={item}>{item}</option>
                  ))}
                </select>
                {showCustomInput.machine && (
                  <div className="mt-2">
                    <input
                      type="text"
                      name="machine"
                      placeholder="Enter new machine"
                      value={customFields.machine}
                      onChange={handleCustomInputChange}
                      className="w-full p-2 border rounded"
                    />
                  </div>
                )}
              </div>

              <div>
                <label className="block mb-2 font-bold">Time:</label>
                <div className="flex items-center">
                  <button type="button" onClick={() => handleTimeChange(-1)} className="px-3 py-1 bg-red-500 text-white rounded">-</button>
                  <input
                    type="number"
                    name="time"
                    value={newOperation.time}
                    onChange={handleInputChange}
                    className="w-20 mx-2 p-2 border rounded text-center"
                  />
                  <button type="button" onClick={() => handleTimeChange(1)} className="px-3 py-1 bg-green-500 text-white rounded">+</button>
                </div>
              </div>
            </div>

            <div>
              <label className="block mb-2 font-bold">Description:</label>
              <textarea
                name="description"
                value={newOperation.description}
                onChange={handleInputChange}
                className="w-full p-2 border rounded"
              />
            </div>
          </div>

          <div className="flex space-x-4">
            <button type="submit" className="px-4 py-2 bg-blue-500 text-white rounded hover:bg-blue-600">
              Add Operation
            </button>
            <button type="button" onClick={handleViewClick} className="px-4 py-2 bg-green-500 text-white rounded hover:bg-green-600">
              View
            </button>
          </div>
        </form>
      </div>

      {filteredOperations.length > 0 && (
        <div className="mt-8">
          <h2 className="text-xl font-bold mb-4">Operations for Component: {newOperation.component}</h2>
          <table className="w-full border-collapse border">
            <thead>
              <tr>
                <th className="border px-4 py-2">Component</th>
                <th className="border px-4 py-2">Description</th>
                <th className="border px-4 py-2">Machine</th>
                <th className="border px-4 py-2">Type</th>
                <th className="border px-4 py-2">Time(mins)</th>
              </tr>
            </thead>
            <tbody>
              {filteredOperations.map((operation, index) => (
                <tr key={index}>
                  <td className="border px-4 py-2">{operation.component}</td>
                  <td className="border px-4 py-2">{operation.description}</td>
                  <td className="border px-4 py-2">{operation.machine}</td>
                  <td className="border px-4 py-2">{operation.type}</td>
                  <td className="border px-4 py-2">{operation.time}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
};

export default AddTaskPage;