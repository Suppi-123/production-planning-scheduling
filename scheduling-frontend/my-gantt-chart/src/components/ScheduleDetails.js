import React, { useState } from 'react';
import axios from 'axios';
import * as XLSX from 'xlsx';  // Import XLSX for Excel export
import 'tailwindcss/tailwind.css';

const ScheduleDetails = () => {
  const [startTime, setStartTime] = useState('');
  const [endTime, setEndTime] = useState('');
  const [scheduleData, setScheduleData] = useState([]);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState(null);
  const [currentPage, setCurrentPage] = useState(1);
  const rowsPerPage = 10;

  const handleSubmit = async () => {
    setIsLoading(true);
    setError(null);
    try {
      const params = {};
      if (startTime) params.start_time = startTime;
      if (endTime) params.end_time = endTime;

      const response = await axios.get('http://172.18.101.47:4567/machine_schedules/', { params });
      const rawData = response.data.machine_schedules;
      const formattedData = [];

      for (const machine in rawData) {
        rawData[machine].forEach(item => {
          formattedData.push({
            machine,
            component: item.component,
            operation: item.operation,
            start_time: item.start_time,
            end_time: item.end_time,
            duration_minutes: item.duration_minutes,
          });
        });
      }

      setScheduleData(formattedData);
    } catch (error) {
      setError('Error fetching schedule data');
      console.error('Error fetching schedule data:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const handlePageChange = (newPage) => {
    setCurrentPage(newPage);
  };

  const currentData = scheduleData.slice(
    (currentPage - 1) * rowsPerPage,
    currentPage * rowsPerPage
  );

  const totalPages = Math.ceil(scheduleData.length / rowsPerPage);

  const getPageNumbers = () => {
    const pageNumbers = [];
    const maxPages = 5;
    const halfPages = Math.floor(maxPages / 2);

    let startPage = Math.max(1, currentPage - halfPages);
    let endPage = Math.min(totalPages, currentPage + halfPages);

    if (currentPage <= halfPages) {
      endPage = Math.min(totalPages, maxPages);
    }
    if (currentPage + halfPages >= totalPages) {
      startPage = Math.max(1, totalPages - maxPages + 1);
    }

    for (let i = startPage; i <= endPage; i++) {
      pageNumbers.push(i);
    }
    return pageNumbers;
  };

  const handleDownloadExcel = () => {
    const worksheet = XLSX.utils.json_to_sheet(scheduleData);
    const workbook = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(workbook, worksheet, 'Schedule Data');
    XLSX.writeFile(workbook, 'schedule_data.xlsx');
  };

  return (
    <div className="container mx-auto p-4">
      <h2 className="text-xl font-bold mb-4">Schedule Details</h2>
      <div className="flex items-center mb-4 space-x-4">
        <div className="flex-1">
          <label className="block mb-2">
            Start Time:
            <input
              type="datetime-local"
              value={startTime}
              onChange={(e) => setStartTime(e.target.value)}
              className="mt-1 block w-40 p-2 border border-gray-300 rounded-md"
            />
          </label>
        </div>
        <div className="flex-1">
          <label className="block mb-2">
            End Time:
            <input
              type="datetime-local"
              value={endTime}
              onChange={(e) => setEndTime(e.target.value)}
              className="mt-1 block w-40 p-2 border border-gray-300 rounded-md"
            />
          </label>
        </div>
        <button
          onClick={handleSubmit}
          className="px-4 py-2 bg-blue-500 text-white rounded-md"
        >
          Submit
        </button>
        <button
          onClick={handleDownloadExcel}
          className="px-4 py-2 bg-green-500 text-white rounded-md"
        >
          Download Excel
        </button>
      </div>
      {isLoading && <p>Loading...</p>}
      {error && <p className="text-red-500">{error}</p>}
      <div className="overflow-x-auto">
        {scheduleData.length > 0 && (
          <table className="min-w-full bg-white border border-gray-300">
            <thead>
              <tr>
                <th className="px-4 py-2 border">Machine</th>
                <th className="px-4 py-2 border">Component</th>
                <th className="px-4 py-2 border">Operation</th>
                <th className="px-4 py-2 border">Start Time</th>
                <th className="px-4 py-2 border">End Time</th>
                <th className="px-4 py-2 border">Duration (minutes)</th>
              </tr>
            </thead>
            <tbody>
              {currentData.map((item, index) => (
                <tr key={index}>
                  <td className="border px-4 py-2">{item.machine}</td>
                  <td className="border px-4 py-2">{item.component}</td>
                  <td className="border px-4 py-2">{item.operation}</td>
                  <td className="border px-4 py-2">{new Date(item.start_time).toLocaleString()}</td>
                  <td className="border px-4 py-2">{new Date(item.end_time).toLocaleString()}</td>
                  <td className="border px-4 py-2">{item.duration_minutes}</td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>
      {scheduleData.length > rowsPerPage && (
        <div className="flex justify-center mt-4">
          <button
            onClick={() => handlePageChange(currentPage - 1)}
            disabled={currentPage === 1}
            className="px-4 py-2 mx-1 bg-gray-300 rounded-md"
          >
            &larr; Previous
          </button>
          {getPageNumbers().map((pageNumber) => (
            <button
              key={pageNumber}
              onClick={() => handlePageChange(pageNumber)}
              className={`px-4 py-2 mx-1 ${currentPage === pageNumber ? 'bg-blue-500 text-white' : 'bg-gray-300'}`}
            >
              {pageNumber}
            </button>
          ))}
          <button
            onClick={() => handlePageChange(currentPage + 1)}
            disabled={currentPage === totalPages}
            className="px-4 py-2 mx-1 bg-gray-300 rounded-md"
          >
            Next &rarr;
          </button>
        </div>
      )}
    </div>
  );
};

export default ScheduleDetails;
