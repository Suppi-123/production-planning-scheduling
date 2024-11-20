import React, { useEffect, useState } from 'react';
import axios from 'axios';

function Maintenance() {
    const [machines, setMachines] = useState([]);
    const [editIndex, setEditIndex] = useState(-1); // Track which row is being edited
    const [editedMachine, setEditedMachine] = useState({}); // Store edited machine data

    // Fetch machine statuses
    const fetchMachines = async () => {
        try {
            const response = await axios.get('http://172.18.7.85:5601/machine_statuses/');
            setMachines(response.data);
        } catch (error) {
            console.error('Error fetching machine statuses:', error);
        }
    };

    useEffect(() => {
        fetchMachines(); // Call fetchMachines on component mount
    }, []);

    const updateMachineStatus = async (id, status, availableFrom) => {
        try {
            await axios.put(`http://172.18.7.85:5601/machine_statuses/${id}`, null, {
                params: {
                    status,
                    available_from: availableFrom,
                },
            });
            // Refresh the machine list after update
            fetchMachines();
        } catch (error) {
            console.error('Error updating machine status:', error);
        }
    };

    const deleteMachine = async (id) => {
        try {
            await axios.delete(`http://172.18.7.85:5601/machine_statuses/${id}`);
            // Refresh the machine list after deletion
            fetchMachines();
        } catch (error) {
            console.error('Error deleting machine:', error);
        }
    };

    const handleEditChange = (e, field) => {
        setEditedMachine({ ...editedMachine, [field]: e.target.value });
    };

    const handleSave = (id) => {
        // Ensure editedMachine has the correct values before saving
        const status = editedMachine.status || machines[editIndex].status;
        const availableFrom = editedMachine.available_from || machines[editIndex].available_from;

        updateMachineStatus(id, status, availableFrom);
        setEditIndex(-1); // Exit edit mode
        setEditedMachine({}); // Clear edited machine data
    };

    return (
        <div className="p-6">
            <h1 className="text-2xl font-bold mb-4">Machine Maintenance</h1>
            <div className="mt-6">
                <h2 className="text-xl font-bold mb-2">Machine Status Table</h2>
                <table className="min-w-full bg-white border border-gray-300">
                    <thead>
                        <tr className="bg-gray-200">
                            <th className="py-2 px-4 border">Machine</th>
                            <th className="py-2 px-4 border">Status</th>
                            <th className="py-2 px-4 border">Available From</th>
                            <th className="py-2 px-4 border">Actions</th>
                        </tr>
                    </thead>
                    <tbody>
                        {machines.map((machine, index) => (
                            <tr key={machine.id} className="hover:bg-gray-100">
                                <td className="py-2 px-4 border">{machine.machine}</td>
                                <td className="py-2 px-4 border">
                                    {editIndex === index ? (
                                        <div className="flex items-center">
                                            <span className={`mr-2 ${editedMachine.status === 'ON' ? 'text-green-500' : 'text-red-500'}`}>
                                                {editedMachine.status || machine.status}
                                            </span>
                                            <label className="relative inline-flex items-center cursor-pointer">
                                                <input
                                                    type="checkbox"
                                                    checked={editedMachine.status === 'ON'}
                                                    onChange={() => handleEditChange({ target: { value: editedMachine.status === 'ON' ? 'OFF' : 'ON' } }, 'status')}
                                                    className="sr-only"
                                                />
                                                <div className="w-11 h-6 bg-gray-200 rounded-full shadow-inner"></div>
                                                <div className={`dot absolute w-5 h-5 bg-white rounded-full shadow transition-transform duration-200 ease-in-out ${editedMachine.status === 'ON' ? 'transform translate-x-5 bg-green-500' : ''}`}></div>
                                            </label>
                                        </div>
                                    ) : (
                                        <span className={machine.status === 'ON' ? 'text-green-500' : 'text-red-500'}>
                                            {machine.status}
                                        </span>
                                    )}
                                </td>
                                <td className="py-2 px-4 border">
                                    {editIndex === index ? (
                                        <input
                                            type="datetime-local"
                                            value={editedMachine.available_from || machine.available_from}
                                            onChange={(e) => handleEditChange(e, 'available_from')}
                                            className="border border-gray-300 rounded p-1"
                                        />
                                    ) : (
                                        new Date(machine.available_from).toLocaleString()
                                    )}
                                </td>
                                <td className="py-2 px-4 border">
                                    {editIndex === index ? (
                                        <>
                                            <button
                                                onClick={() => handleSave(machine.id)}
                                                className="bg-green-500 text-white py-1 px-2 rounded hover:bg-green-600"
                                            >
                                                Save
                                            </button>
                                            <button
                                                onClick={() => setEditIndex(-1)}
                                                className="ml-2 bg-gray-500 text-white py-1 px-2 rounded hover:bg-gray-600"
                                            >
                                                Cancel
                                            </button>
                                        </>
                                    ) : (
                                        <>
                                            <button
                                                onClick={() => {
                                                    setEditIndex(index);
                                                    setEditedMachine({ status: machine.status, available_from: machine.available_from });
                                                }}
                                                className="bg-blue-500 text-white py-1 px-2 rounded hover:bg-blue-600"
                                            >
                                                Edit
                                            </button>
                                            <button
                                                onClick={() => deleteMachine(machine.id)}
                                                className="ml-2 bg-red-500 text-white py-1 px-2 rounded hover:bg-red-600"
                                            >
                                                Delete
                                            </button>
                                        </>
                                    )}
                                </td>
                            </tr>
                        ))}
                    </tbody>
                </table>
            </div>
        </div>
    );
}

export default Maintenance;