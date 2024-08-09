import React, { useState, useEffect } from 'react';
import axios from 'axios';

const AddTaskPage = () => {
  const [operations, setOperations] = useState([]);
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
      const response = await axios.get('http://172.18.101.47:4567/fetch_operations/');
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
      await axios.post('http://172.18.101.47:4567/post_operations/', {
        operations: [operationToSubmit],
      });
      alert('Operation added successfully!');
      setNewOperation({
        component: '',
        description: '',
        type: '',
        machine: '',
        time: 0,
      });
      setCustomFields({
        component: '',
        type: '',
        machine: '',
      });
      setShowCustomInput({
        component: false,
        type: false,
        machine: false,
      });
      fetchOperations();
    } catch (error) {
      console.error('Error adding operation:', error);
      alert('Failed to add operation.');
    }
  };

  return (
    <div className="container mx-auto p-4">
      <h1 className="text-2xl font-bold mb-4">Add New Operation</h1>
      <form onSubmit={handleSubmit} className="space-y-4">
        {['component', 'type', 'machine'].map((field) => (
          <div key={field}>
            <label className="block mb-2 font-bold">{field.charAt(0).toUpperCase() + field.slice(1)}:</label>
            <select
              name={field}
              value={newOperation[field]}
              onChange={handleInputChange}
              className="w-full p-2 border rounded"
            >
              <option value="">Select {field}</option>
              {eval(field + 's').map((item, index) => (
                <option key={index} value={item}>{item}</option>
              ))}
            </select>
            {showCustomInput[field] && (
              <div className="mt-2">
                <input
                  type="text"
                  name={field}
                  placeholder={`Enter new ${field}`}
                  value={customFields[field]}
                  onChange={handleCustomInputChange}
                  className="w-full p-2 border rounded"
                />
              </div>
            )}
          </div>
        ))}
        
        <div>
          <label className="block mb-2 font-bold">Description:</label>
          <textarea
            name="description"
            value={newOperation.description}
            onChange={handleInputChange}
            className="w-full p-2 border rounded"
          />
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
        
        <button type="submit" className="px-4 py-2 bg-blue-500 text-white rounded hover:bg-blue-600">
          Add Operation
        </button>
      </form>
    </div>
  );
};

export default AddTaskPage;
