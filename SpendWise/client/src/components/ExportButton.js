import React from "react";

const ExportButton = ({ frequency, selectedDate, type }) => {
  const handleExport = async () => {
    try {
      const user = JSON.parse(localStorage.getItem("user"));
      const response = await fetch("/transections/export-expenses", {
        method: "POST", // Use POST to send body data
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          userid: user._id,
          frequency,
          selectedDate: selectedDate ? selectedDate.map(date => date.format("YYYY-MM-DD")) : [],
          type,
        }),
      });
      if (response.ok) {
        // Create a URL for the file
        const url = window.URL.createObjectURL(await response.blob());
        const link = document.createElement("a");
        link.href = url;
        link.setAttribute("download", "filtered_expenses.csv"); // Default file name
        document.body.appendChild(link);
        link.click();
        link.remove();
      } else {
        alert("Error exporting data");
      }
    } catch (err) {
      alert("Error exporting data");
    }
  };

  return <button className="btn btn-primary" onClick={handleExport}>Export Selected Expenses</button>;
};

export default ExportButton;
