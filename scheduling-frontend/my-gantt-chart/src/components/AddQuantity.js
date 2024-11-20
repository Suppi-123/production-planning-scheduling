import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { ToastContainer, toast } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';

const AddQuantity = ({ selectedComponentData }) => {
  const [components, setComponents] = useState([]);
  const [quantity, setQuantity] = useState(0);
  const [selectedComponent, setSelectedComponent] = useState('');
  const [fetchedQuantities, setFetchedQuantities] = useState([]);
  const [dueDate, setDueDate] = useState('');
  const [viewData, setViewData] = useState([]);
  const [showTable, setShowTable] = useState(false);
  const [dueDateData, setDueDateData] = useState([]);
  const [showDueDateTable, setShowDueDateTable] = useState(false);
   // New state variables for raw materials
   const [rawMaterialsData, setRawMaterialsData] = useState([]);
   const [showRawMaterialsTable, setShowRawMaterialsTable] = useState(false);
   const [isAvailable, setIsAvailable] = useState(true);
   const [availableFrom, setAvailableFrom] = useState('');
 

  useEffect(() => {
    fetchComponents();
  }, []);

  
  useEffect(() => {
    if (selectedComponentData && components.includes(selectedComponentData)) {
      setSelectedComponent(selectedComponentData);
      fetchComponentQuantitiesForSelected(selectedComponentData);
      fetchDueDatesForSelected(selectedComponentData);
      fetchRawMaterials();
    }
  }, [selectedComponentData, components]);

  const fetchRawMaterials = async () => {
    try {
      const response = await axios.get('http://172.18.7.85:5601/raw_materials/');
      setRawMaterialsData(response.data);
      setShowRawMaterialsTable(true);
    } catch (error) {
      console.error('Error fetching raw materials:', error);
      toast.error('Failed to fetch raw materials');
    }
  };

  const fetchComponents = async () => {
    try {
      const response = await axios.get('http://172.18.7.85:5601/fetch_operations/');
      const data = response.data;
      const componentList = [...new Set(data.map(item => item.component))];
      setComponents(componentList);
      setFetchedQuantities(data);
    } catch (error) {
      console.error('Error fetching components:', error);
      toast.error('Failed to fetch components');
    }
  };

  const fetchComponentQuantitiesForSelected = async (component) => {
    try {
      const response = await axios.get('http://172.18.7.85:5601/fetch_component_quantities/');
      if (typeof response.data === 'object') {
        const filteredData = Object.entries(response.data)
          .filter(([comp]) => comp === component)
          .map(([comp, qty]) => ({ component: comp, quantity: qty }));
        setViewData(filteredData);
        setShowTable(true);
      }
    } catch (error) {
      console.error('Error fetching component quantities:', error);
      toast.error('Failed to fetch component quantities');
    }
  };

  const fetchDueDatesForSelected = async (component) => {
    try {
      const response = await axios.get('http://172.18.7.85:5601/lead-time-table');
      const filteredData = response.data.filter(item => item.component === component);
      setDueDateData(filteredData);
      setShowDueDateTable(true);
    } catch (error) {
      console.error('Error fetching due dates:', error);
      toast.error('Failed to fetch due dates');
    }
  };

  const handleShowRawMaterialsTable = (component) => {
    setSelectedComponent(component); // Update the selected component
    fetchRawMaterials(); // Fetch raw materials
};

const handleComponentChange = (e) => {
  const newComponent = e.target.value;
  setSelectedComponent(newComponent);
  if (newComponent) {
      fetchComponentQuantitiesForSelected(newComponent);
      fetchDueDatesForSelected(newComponent);
      fetchRawMaterials(); // Fetch raw materials
      setShowRawMaterialsTable(true); // Automatically show raw materials table
  } else {
      setShowRawMaterialsTable(false); // Hide if no component is selected
  }
};
  
  const handleQuantityChange = (e) => {
    setQuantity(e.target.value);
  };

  const handleDueDateChange = (e) => {
    setDueDate(e.target.value);
  };

  const handleViewQuantities = () => {
    if (selectedComponent) {
      fetchComponentQuantitiesForSelected(selectedComponent);
    } else {
      toast.warning('Please select a component first');
    }
  };

  const handleViewDueDates = () => {
    if (selectedComponent) {
      fetchDueDatesForSelected(selectedComponent);
    } else {
      toast.warning('Please select a component first');
    }
  };

  const handleAddQuantity = async () => {
    if (!selectedComponent || quantity <= 0) {
      toast.error('Please select a component and enter a valid quantity.');
      return;
    }

    try {
      await axios.post('http://172.18.7.85:5601/insert_component_quantities/', [
        {
          component: selectedComponent,
          quantity: parseInt(quantity, 10),
        }
      ]);
      toast.success('Quantity added successfully!');
      setQuantity(0);
      fetchComponents();
      fetchComponentQuantitiesForSelected(selectedComponent);
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
      await axios.post('http://172.18.7.85:5601/insert_lead_times/', [
        {
          component: selectedComponent,
          due_date: dueDate,
        }
      ]);
      toast.success('Due Date added successfully!');
      setDueDate('');
      fetchDueDatesForSelected(selectedComponent);
    } catch (error) {
      console.error('Error adding due date:', error);
      toast.error('Failed to add due date.');
    }
  };

  const handleAvailableChange = (e) => {
    setIsAvailable(e.target.checked);
  };

  const handleAvailableFromChange = (e) => {
    setAvailableFrom(e.target.value);
  };

  const handleAddRawMaterial = async () => {
    if (!selectedComponent || !availableFrom) {
      toast.error('Please select a component and enter availability date.');
      return;
    }
  
    try {
      // Construct the URL with query parameters
      const url = `http://172.18.7.85:5601/raw_materials/112?available=${isAvailable}&available_from=${new Date(availableFrom).toISOString()}`;
  
      // Use PUT instead of POST
      const response = await axios.put(url, {
        name: selectedComponent,
        available: isAvailable,
        available_from: new Date(availableFrom).toISOString(),
      });
  
      toast.success('Raw material updated successfully!');
      setAvailableFrom('');
      setIsAvailable(true); // Reset to default true
      fetchRawMaterials();
    } catch (error) {
      console.error('Error adding raw material:', error);
      const errorMessage = error.response?.data?.message || 'Failed to update raw material';
      toast.error(errorMessage);
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

            
          </div>
        </div>
      </div>

      {/* New Raw Materials card */}
      <div className="flex-1 bg-white shadow-md rounded-lg p-6 border border-gray-200 mt-4">
        <h1 className="text-2xl font-bold mb-4">Raw Materials</h1>
        <div className="space-y-4">
          <div>
            <label className="block mb-2 font-bold">Component Name:</label>
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

          <div className="flex items-center space-x-2">
  <label className="font-bold">Available:</label>
  <span 
    className={`relative inline-block w-12 h-6 rounded-full cursor-pointer transition-colors duration-300 ${isAvailable ? 'bg-green-500' : 'bg-red-500'}`} 
    onClick={() => setIsAvailable(!isAvailable)}
  >
    <span className={`absolute left-1 top-1 w-4 h-4 rounded-full bg-white transition-transform duration-300 ${isAvailable ? 'translate-x-6' : 'translate-x-0'}`}></span>
  </span>
  <span className="font-bold">{isAvailable ? 'Yes' : 'No'}</span>
</div>

          <div>
            <label className="block mb-2 font-bold">Available From:</label>
            <input
              type="datetime-local"
              value={availableFrom}
              onChange={(e) => setAvailableFrom(e.target.value)}
              className="w-full p-2 border rounded"
              required
            />
          </div>

          <div className="flex space-x-4">
            <button
              onClick={handleAddRawMaterial}
              className="px-4 py-2 bg-purple-500 text-white rounded hover:bg-purple-600"
            >
              Add Raw Material
            </button>
            
          </div>
        </div>
      </div>


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


          {/* Raw Materials Table */}
          {showRawMaterialsTable && (
     <div className="flex-1 bg-white shadow-md rounded-lg p-6 border border-gray-200">
        <h2 className="text-xl font-bold mb-4">Raw Materials List</h2>
        <table className="min-w-full border-collapse border border-gray-200">
            <thead>
                <tr>
                    <th className="border border-gray-300 p-2">Name</th>
                    <th className="border border-gray-300 p-2">Available</th>
                    <th className="border border-gray-300 p-2">Available From</th>
                </tr>
            </thead>
            <tbody>
                {rawMaterialsData
                    .filter(item => item.name === selectedComponent) // Filter by selected component
                    .map((item, index) => (
                        <tr key={index} className="hover:bg-gray-100">
                            <td className="border border-gray-300 p-2">{item.name}</td>
                            <td className="border border-gray-300 p-2">
                                {item.available ? 'Yes' : 'No'}
                            </td>
                            <td className="border border-gray-300 p-2">
                                {new Date(item.available_from).toLocaleString()}
                            </td>
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