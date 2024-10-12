import React, { useState } from 'react';

const apiUrl = 'https://spend-wise-xi.vercel.app';

const ExportButton = ({ frequency, selectedDate, type }) => {
  const [loading, setLoading] = useState(false); // For loading state

  const handleExport = async () => {
    try {
      const user = JSON.parse(localStorage.getItem("user"));
      if (!user) {
        alert("User not authenticated");
        return;
      }

      // Prepare the data to send
      const requestData = {
        userid: user._id,
        frequency,
        selectedDate: selectedDate ? selectedDate.map(date => date.format("YYYY-MM-DD")) : [],
        type,
      };
      console.log(requestData);

      setLoading(true); // Set loading state

      // Make the POST request to the export API
      const response = await fetch(`${apiUrl}/api/v1/transections/export-expenses`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(requestData),
      });

      setLoading(false); // Reset loading state

      if (response.ok) {
        // Create a URL for the file and trigger download
        const url = window.URL.createObjectURL(await response.blob());
        const link = document.createElement("a");
        link.href = url;
        link.setAttribute("download", "expenses.csv");
        document.body.appendChild(link);
        link.click();
        link.remove();
      } else {
        const errorMessage = await response.text(); // Get error message from the response
        alert(`Error exporting data: ${errorMessage}`);
      }
    } catch (err) {
      setLoading(false); // Reset loading state
      console.error('Export error:', err); // Log error for debugging
      alert("Error exporting data");
    }
  };

  return (
    <button className="btn btn-primary" onClick={handleExport} disabled={loading}>
      {loading ? 'Exporting...' : 'Export Selected Expenses'}
    </button>
  );
};

export default ExportButton;