import React, { useState, useEffect, useRef } from 'react';
import axios from 'axios';
import moment from 'moment';
import { DataSet, Timeline } from 'vis-timeline/standalone';
import 'vis-timeline/styles/vis-timeline-graph2d.min.css';

// Function to generate colors
const generateColor = (index) => {
  const colors = [
    '#FF5733', '#33FF57', '#00008b', '#FF33FF', '#FFFF33', 
    '#33FFFF', '#FF8C00', '#8B008B', '#FF6347', '#4682B4', 
    '#6A5ACD', '#7FFF00', '#D2691E', '#DC143C', '#00FFFF'
  ];
  return colors[index % colors.length];
};

const GanttChart = () => {
  const [tasks, setTasks] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [viewMode, setViewMode] = useState('day');
  const [currentStart, setCurrentStart] = useState(null);
  const [currentEnd, setCurrentEnd] = useState(null);
  const [components, setComponents] = useState([]);
  const [machines, setMachines] = useState([]);
  const [types, setTypes] = useState([]);
  const timelineRef = useRef(null);
  const timelineInstance = useRef(null);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const response = await axios.get('http://172.18.101.47:4567/schedule/');
        setTasks(response.data);

        const optionsResponse = await axios.get('http://172.18.101.47:4567/operations/');
        const uniqueComponents = [...new Set(optionsResponse.data.map(item => item.component))];
        const uniqueMachines = [...new Set(optionsResponse.data.map(item => item.machine))];
        const uniqueTypes = [...new Set(optionsResponse.data.map(item => item.type))];

        setComponents(uniqueComponents);
        setMachines(uniqueMachines);
        setTypes(uniqueTypes);

        setLoading(false);
      } catch (error) {
        console.error('Error fetching data:', error);
        setError('Failed to fetch data');
        setLoading(false);
      }
    };
    fetchData();
  }, []);
  useEffect(() => {
    if (tasks.length > 0 && timelineRef.current) {
      const container = timelineRef.current;
  
      // Generate a color map based on components
      const colorMap = {};
      components.forEach((component, index) => {
        colorMap[component] = generateColor(index);
      });
  
      const items = new DataSet(
        tasks.map((task, index) => ({
          id: index,
          content: task.description,
          start: task.start_time,
          end: task.end_time,
          group: task.machine,
          className: task.component,
          title: `<strong>Description:</strong> ${task.description}<br><strong>Start:</strong> ${moment(task.start_time).format('YYYY-MM-DD HH:mm:ss')}<br><strong>End:</strong> ${moment(task.end_time).format('YYYY-MM-DD HH:mm:ss')}`,
          style: `background-color: ${colorMap[task.component] || '#ccc'};`
        }))
      );
  
      const groups = new DataSet(
        [...new Set(tasks.map(task => task.machine))].map(machine => ({
          id: machine,
          content: machine
        }))
      );
  
      const options = {
        start: currentStart ? currentStart.toDate() : moment(tasks[0].start_time).toDate(),
        end: currentEnd ? currentEnd.toDate() : moment(tasks[0].end_time).toDate(),
        editable: true,
        stack: false,
        verticalScroll: true,
        zoomable: false,
        orientation: 'top',
        timeAxis: {
          scale: viewMode === 'day' ? 'hour' : 'hour',
          step: 1
        },
        format: {
          minorLabels: {
            hour: 'h:mm A',
            weekday: 'ddd D'
          },
          majorLabels: {
            hour: 'ddd D MMMM',
            weekday: 'MMMM YYYY'
          }
        },
        tooltip: {
          followMouse: true
        },
        min: currentStart ? currentStart.toDate() : moment(tasks[0].start_time).toDate(),
        max: currentEnd ? currentEnd.toDate() : moment(tasks[0].end_time).toDate(),
        hiddenDates: [
          { start: `${moment().startOf('day').format('YYYY-MM-DD')}T00:00:00`, end: `${moment().startOf('day').format('YYYY-MM-DD')}T09:00:00`, repeat: 'daily' },
          { start: `${moment().startOf('day').format('YYYY-MM-DD')}T17:00:00`, end: `${moment().startOf('day').format('YYYY-MM-DD')}T24:00:00`, repeat: 'daily' }
        ]
      };
  
      if (!timelineInstance.current) {
        timelineInstance.current = new Timeline(container, items, groups, options);
      } else {
        timelineInstance.current.setOptions(options);
        timelineInstance.current.setItems(items);
        timelineInstance.current.setGroups(groups);
      }
  
      // Set the window explicitly
      if (currentStart && currentEnd) {
        timelineInstance.current.setWindow(currentStart.toDate(), currentEnd.toDate());
      }
    }
  }, [tasks, viewMode, components, currentStart, currentEnd]);

  const handleNext = () => {
    if (currentStart && currentEnd) {
      let newStart, newEnd;
      if (viewMode === 'day') {
        newStart = moment(currentStart).add(1, 'day').startOf('day').hour(9);
        newEnd = moment(newStart).endOf('day').hour(17);
      } else if (viewMode === 'week') {
        newStart = moment(currentStart).add(1, 'week').startOf('week').hour(9);
        newEnd = moment(newStart).endOf('week').hour(17);
      }
      setCurrentStart(newStart);
      setCurrentEnd(newEnd);
      if (timelineInstance.current) {
        timelineInstance.current.setWindow(newStart.toDate(), newEnd.toDate());
      }
    }
  };
  
  const handlePrevious = () => {
    if (currentStart && currentEnd) {
      let newStart, newEnd;
      if (viewMode === 'day') {
        newStart = moment(currentStart).subtract(1, 'day').startOf('day').hour(9);
        newEnd = moment(newStart).endOf('day').hour(17);
      } else if (viewMode === 'week') {
        newStart = moment(currentStart).subtract(1, 'week').startOf('week').hour(9);
        newEnd = moment(newStart).endOf('week').hour(17);
      }
      setCurrentStart(newStart);
      setCurrentEnd(newEnd);
      if (timelineInstance.current) {
        timelineInstance.current.setWindow(newStart.toDate(), newEnd.toDate());
      }
    }
  };

  // Add this effect to handle view mode changes
useEffect(() => {
  if (tasks.length > 0) {
    const minDate = moment.min(tasks.map(task => moment(task.start_time)));
    let viewStart, viewEnd;
    if (viewMode === 'day') {
      viewStart = minDate.clone().startOf('day').hour(9);
      viewEnd = minDate.clone().endOf('day').hour(17);
    } else if (viewMode === 'week') {
      viewStart = minDate.clone().startOf('week').hour(9);
      viewEnd = minDate.clone().endOf('week').hour(17);
    }
    setCurrentStart(viewStart);
    setCurrentEnd(viewEnd);
    if (timelineInstance.current) {
      timelineInstance.current.setWindow(viewStart.toDate(), viewEnd.toDate());
    }
  }
}, [viewMode, tasks]);
 

  if (loading) return <div className="text-center">Loading...</div>;
  if (error) return <div className="text-center text-red-500">{error}</div>;

  return (
    <div>
      <div className="flex justify-between items-center mb-4">
        <div>
          <button className="px-4 py-2 bg-gray-300" onClick={handlePrevious}>
            Previous {viewMode === 'day' ? 'Day' : 'Week'}
          </button>
          <button className="px-4 py-2 bg-gray-300 ml-2" onClick={handleNext}>
            Next {viewMode === 'day' ? 'Day' : 'Week'}
          </button>
        </div>
        <select
          value={viewMode}
          onChange={(e) => setViewMode(e.target.value)}
          className="px-4 py-2 bg-gray-100"
        >
          <option value="day">Day View</option>
          <option value="week">Week View</option>
        </select>
      </div>
      <div ref={timelineRef} style={{ height: '600px' }}></div>
    </div>
  );
};

export default GanttChart;
