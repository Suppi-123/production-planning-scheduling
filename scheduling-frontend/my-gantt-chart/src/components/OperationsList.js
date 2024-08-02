import React, { useState, useEffect } from 'react';
import axios from 'axios';

const OperationsList = () => {
    const [operations, setOperations] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);

    useEffect(() => {
        fetchOperations();
    }, []);

    const fetchOperations = async () => {
        try {
            const response = await axios.get('http://172.18.101.47:1234/operations/');
            console.log('Response:', response); // Log response details for inspection
            setOperations(response.data);
            setLoading(false);
        } catch (error) {
            if (error.response) {
                // The request was made and the server responded with a status code
                console.error('Response error:', error.response);
                setError(`Error ${error.response.status}: ${error.response.data.message}`);
            } else if (error.request) {
                // The request was made but no response was received
                console.error('No response received:', error.request);
                setError('No response received from server. Check network connection.');
            } else {
                // Something happened in setting up the request that triggered an error
                console.error('Request error:', error.message);
                setError('Error fetching data. Please try again later.');
            }
            setLoading(false);
        }
    };

    if (loading) {
        return <div>Loading...</div>;
    }

    if (error) {
        return <div>Error fetching operations: {error}</div>;
    }

    return (
        <div>
            <h2>Operations List</h2>
            <ul>
                {operations.map(operation => (
                    <li key={operation.id}>
                        {operation.name} - {operation.description}
                    </li>
                ))}
            </ul>
        </div>
    );
};

export default OperationsList;
