import React, { useState, useEffect } from 'react';
import axios from 'axios';

const OverallTime = () => {
    const [overallTime, setOverallTime] = useState('');
    const [completionTime, setCompletionTime] = useState('');

    useEffect(() => {
        fetchOverallTime();
    }, []);

    const fetchOverallTime = async () => {
        try {
            const response = await axios.get('http://192.168.10.21:1234/schedule/');
            setOverallTime(response.data.overall_time);
            setCompletionTime(response.data.overall_end_time);
        } catch (error) {
            console.error('Error fetching overall time:', error);
        }
    };

    return (
        <div>
            <h2>Overall Time</h2>
            <p>Time to Complete All Components: {overallTime}</p>
            <p>Completion Time: {completionTime}</p>
        </div>
    );
};

export default OverallTime;
