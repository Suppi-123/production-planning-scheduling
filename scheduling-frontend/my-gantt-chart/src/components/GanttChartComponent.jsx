import React, { useState, useEffect, useRef } from 'react';
import axios from 'axios';
import moment from 'moment';
import { DataSet, Timeline } from 'vis-timeline/standalone';
import 'vis-timeline/styles/vis-timeline-graph2d.min.css';
import * as XLSX from 'xlsx';

// Function to generate colors
const generateColor = (index) => {
  const colors = [
    '#FF5733', '#33FF57', '#00008b', '#FF33FF', '#FFFF33', 
    '#33FFFF', '#FF8C00', '#8B008B', '#FF6347', '#4682B4', 
    '#6A5ACD', '#7FFF00', '#D2691E', '#DC143C', '#00FFFF',
    '#FF1493', '#FFD700', '#32CD32', '#FF4500', '#DA70D6',
    '#00FF7F', '#FFDAB9', '#FF6347', '#D2B48C', '#ADFF2F',
  ];
  return colors[index % colors.length];
};

const GanttChart = () => {
  const [colorMap, setColorMap] = useState({});
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
  const [selectedComponent, setSelectedComponent] = useState('All');
  const [selectedMachine, setSelectedMachine] = useState('All');
  const [selectedType, setSelectedType] = useState('All');
  const [statusData, setStatusData] = useState({
    early_complete: [],
    on_time_complete: [],
    delayed_complete: []
  });
  const [selectedStatus, setSelectedStatus] = useState('All');

  useEffect(() => {
    const fetchData = async () => {
      try {
        const [scheduleResponse, optionsResponse, statusResponse] = await Promise.all([
          axios.get('http://172.18.7.85:4567/schedule/'),
          axios.get('http://172.18.7.85:4567/fetch_operations/'),
          axios.get('http://172.18.7.85:4567/component_status/')
        ]);

        setTasks(scheduleResponse.data);
        setStatusData(statusResponse.data);

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

  const getFilteredTasks = () => {
    let filteredTasks = tasks.filter(task => 
      (selectedComponent === 'All' || task.component === selectedComponent) &&
      (selectedMachine === 'All' || task.machine === selectedMachine) &&
      (selectedType === 'All' || task.type === selectedType)
    );

    if (selectedStatus !== 'All') {
      const statusComponents = statusData[selectedStatus].map(item => item.component);
      filteredTasks = filteredTasks.filter(task => statusComponents.includes(task.component));
    }

    return filteredTasks;
  };

  useEffect(() => {
    if (tasks.length > 0 && timelineRef.current) {
      const container = timelineRef.current;
      const filteredTasks = getFilteredTasks();

      // Generate a color map based on components
      const newColorMap = {};
      components.forEach((component, index) => {
        newColorMap[component] = generateColor(index);
      });
      setColorMap(newColorMap);

      const items = new DataSet(
        filteredTasks.map((task, index) => ({
          id: index,
          content: task.description,
          start: task.start_time,
          end: task.end_time,
          group: task.machine,
          className: task.component,
          title: `<strong>Component:</strong> ${task.component}<br>
          <strong>Description:</strong> ${task.description}<br>
          <strong>Machine:</strong> ${task.machine}<br>
          <strong>Quantity:</strong> ${task.quantity}<br>
          <strong>Start:</strong> ${moment(task.start_time).format('YYYY-MM-DD HH:mm:ss')}<br>
          <strong>End:</strong> ${moment(task.end_time).format('YYYY-MM-DD HH:mm:ss')}`,
          style: `background-color: ${newColorMap[task.component] || '#ccc'};`
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
  }, [tasks, viewMode, components, currentStart, currentEnd, selectedComponent, selectedMachine, selectedType, selectedStatus]);

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

  const handleGenerate = async () => {
    try {
      const response = await axios.get('http://172.18.7.85:4567/schedule/');
      const data = response.data;

      if (data && Array.isArray(data) && data.length > 0) {
        const ws = XLSX.utils.json_to_sheet(data);
        const wb = XLSX.utils.book_new();
        XLSX.utils.book_append_sheet(wb, ws, 'Gantt Data');
        XLSX.writeFile(wb, 'gantt_data.xlsx');
      } else {
        alert('No data found to export.');
      }
    } catch (error) {
      console.error('Error exporting data:', error);
      alert('There was an issue exporting the data. Please try again.');
    }
  };

  const handleStatusChange = (e) => {
    setSelectedStatus(e.target.value);
    setSelectedComponent('All'); // Reset component selection when changing status
  };

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
        <button 
          onClick={handleGenerate} 
          className="px-4 py-2 bg-blue-500 text-white ml-2 rounded-lg"
        >
          Generate
        </button>
      </div>
      <select
        value={selectedStatus}
        onChange={handleStatusChange}
        className="px-4 py-2 bg-gray-100 ml-2"
      >
        <option value="All">All Status</option>
        <option value="early_complete">Early Complete</option>
        <option value="on_time_complete">On Time Complete</option>
        <option value="delayed_complete">Delayed Complete</option>
      </select>
      <select
        value={selectedComponent}
        onChange={(e) => setSelectedComponent(e.target.value)}
        className="px-4 py-2 bg-gray-100 ml-2"
      >
        <option value="All">All Components</option>
        {selectedStatus === 'All'
          ? components.map(component => (
              <option key={component} value={component} style={{ backgroundColor: colorMap[component] }}>
                {component}
              </option>
            ))
          : statusData[selectedStatus].map(item => (
              <option key={item.component} value={item.component} style={{ backgroundColor: colorMap[item.component] }}>
                {item.component}
              </option>
            ))
        }
      </select>
      <select
        value={selectedMachine}
        onChange={(e) => setSelectedMachine(e.target.value)}
        className="px-4 py-2 bg-gray-100 ml-2"
      >
        <option value="All">All Machines</option>
        {machines.map(machine => (
          <option key={machine} value={machine} style={{ backgroundColor: colorMap[machine] }}>
            {machine}
          </option>
        ))}
      </select>
      <select
        value={selectedType}
        onChange={(e) => setSelectedType(e.target.value)}
        className="px-4 py-2 bg-gray-100 ml-2"
      >
        <option value="All">All Types</option>
        {types.map(type => (
          <option key={type} value={type}>{type}</option>
        ))}
      </select>

      <div ref={timelineRef} style={{ height: '600px' }}></div>
    </div>
  );
};

export default GanttChart;