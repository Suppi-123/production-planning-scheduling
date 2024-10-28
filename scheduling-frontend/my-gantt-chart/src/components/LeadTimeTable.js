// import React, { useState, useEffect } from 'react';
// import axios from 'axios';

// const LeadTimeTable = () => {
//   const [data, setData] = useState([]);

//   useEffect(() => {
//     const fetchData = async () => {
//       try {
//         const response = await axios.get('http://172.18.7.85:5609/lead-time-table');
//         setData(response.data);
//       } catch (error) {
//         console.error('Error fetching data:', error);
//       }
//     };

//     fetchData();
//   }, []);

//   return (
//     <div>
//       <h2>Lead Time Table</h2>
//       <table>
//         <thead>
//           <tr>
//             <th>Component</th>
//             <th>Due Date</th>
//           </tr>
//         </thead>
//         <tbody>
//           {data.map((item, index) => (
//             <tr key={index}>
//               <td>{item.component}</td>
//               <td>{new Date(item.due_date).toLocaleString()}</td>
//             </tr>
//           ))}
//         </tbody>
//       </table>
//     </div>
//   );
// };

// export default LeadTimeTable;


import React from 'react'

const LeadTimeTable = () => {
  return (
    <div>
      hello
    </div>
  )
}

export default LeadTimeTable
