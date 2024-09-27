// src/components/TaskForm.js

import React, { useState, useEffect } from 'react';
import axios from 'axios';

const TaskForm = () => {
  const [components, setComponents] = useState([]);
  const [machines, setMachines] = useState([]);
  const [types, setTypes] = useState([]);
  const [manualInputs, setManualInputs] = useState({
    component: '',
    machine: '',
    type: '',
  });
  const [selectedManualInput, setSelectedManualInput] = useState({
    component: '',
    machine: '',
    type: '',
  });
  const [formData, setFormData] = useState({
    description: '',
    time: '',  // This will now represent time in minutes
    machine: '',
    component: '',
    type: ''
  });

  useEffect(() => {
    const fetchOptions = async () => {
      try {
        const response = await axios.get('http://172.18.7.85:4568/operations/');
        const uniqueComponents = [...new Set(response.data.map(item => item.component))];
        const uniqueMachines = [...new Set(response.data.map(item => item.machine))];
        const uniqueTypes = [...new Set(response.data.map(item => item.type))];

        setComponents(uniqueComponents);
        setMachines(uniqueMachines);
        setTypes(uniqueTypes);
      } catch (error) {
        console.error('Error fetching options:', error);
      }
    };
    fetchOptions();
  }, []);

  const handleFormChange = (e) => {
    const { name, value } = e.target;
    setFormData({ ...formData, [name]: value });
    if (name === 'component') {
      setSelectedManualInput({ ...selectedManualInput, component: value });
    } else if (name === 'machine') {
      setSelectedManualInput({ ...selectedManualInput, machine: value });
    } else if (name === 'type') {
      setSelectedManualInput({ ...selectedManualInput, type: value });
    }
  };

  const handleManualChange = (e) => {
    const { name, value } = e.target;
    setManualInputs({ ...manualInputs, [name]: value });
  };

  const handleManualSubmit = (e) => {
    e.preventDefault();
    setSelectedManualInput({ ...selectedManualInput, [e.target.name]: manualInputs[e.target.name] });
    setManualInputs({ ...manualInputs, [e.target.name]: '' });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      await axios.post('http://172.18.7.85:4568/operations/', formData);
      alert('Task added successfully!');
      setFormData({ description: '', time: '', machine: '', component: '', type: '' });
    } catch (error) {
      console.error('Error adding task:', error);
      alert('Failed to add task');
    }
  };

  return (
    <div>
      <h2 className="text-xl mb-4">Add New Task</h2>
      <form onSubmit={handleSubmit} className="space-y-4">
        <div>
          <label className="block mb-1">Description:</label>
          <input
            type="text"
            name="description"
            value={formData.description}
            onChange={handleFormChange}
            className="p-2 border border-gray-300 rounded w-full"
          />
        </div>
        <div>
          <label className="block mb-1">Time (in minutes):</label>
          <input
            type="number"
            name="time"
            value={formData.time}
            onChange={handleFormChange}
            className="p-2 border border-gray-300 rounded w-full"
            placeholder="Enter time in minutes"
          />
        </div>
        <div>
          <label className="block mb-1">Machine:</label>
          <select
            name="machine"
            value={formData.machine}
            onChange={handleFormChange}
            className="p-2 border border-gray-300 rounded w-full"
          >
            <option value="">Select Machine</option>
            {machines.map((machine, index) => (
              <option key={index} value={machine}>{machine}</option>
            ))}
          </select>
          <button type="button" onClick={() => setSelectedManualInput({ ...selectedManualInput, machine: manualInputs.machine })}>
            Add Machine
          </button>
          <input
            type="text"
            name="machine"
            value={manualInputs.machine}
            onChange={handleManualChange}
            placeholder="New machine"
            className="p-2 border border-gray-300 rounded w-full mt-2"
          />
          <button onClick={handleManualSubmit} name="machine" className="px-4 py-2 bg-gray-300 mt-2">Add</button>
        </div>
        <div>
          <label className="block mb-1">Component:</label>
          <select
            name="component"
            value={formData.component}
            onChange={handleFormChange}
            className="p-2 border border-gray-300 rounded w-full"
          >
            <option value="">Select Component</option>
            {components.map((component, index) => (
              <option key={index} value={component}>{component}</option>
            ))}
          </select>
          <button type="button" onClick={() => setSelectedManualInput({ ...selectedManualInput, component: manualInputs.component })}>
            Add Component
          </button>
          <input
            type="text"
            name="component"
            value={manualInputs.component}
            onChange={handleManualChange}
            placeholder="New component"
            className="p-2 border border-gray-300 rounded w-full mt-2"
          />
          <button onClick={handleManualSubmit} name="component" className="px-4 py-2 bg-gray-300 mt-2">Add</button>
        </div>
        <div>
          <label className="block mb-1">Type:</label>
          <select
            name="type"
            value={formData.type}
            onChange={handleFormChange}
            className="p-2 border border-gray-300 rounded w-full"
          >
            <option value="">Select Type</option>
            {types.map((type, index) => (
              <option key={index} value={type}>{type}</option>
            ))}
          </select>
          <button type="button" onClick={() => setSelectedManualInput({ ...selectedManualInput, type: manualInputs.type })}>
            Add Type
          </button>
          <input
            type="text"
            name="type"
            value={manualInputs.type}
            onChange={handleManualChange}
            placeholder="New type"
            className="p-2 border border-gray-300 rounded w-full mt-2"
          />
          <button onClick={handleManualSubmit} name="type" className="px-4 py-2 bg-gray-300 mt-2">Add</button>
        </div>
        <button type="submit" className="px-4 py-2 bg-blue-500 text-white rounded">Add Task</button>
      </form>
    </div>
  );
};

export default TaskForm;
