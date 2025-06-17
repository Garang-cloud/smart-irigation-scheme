import React from 'react';
import { Line } from 'react-chartjs-2';
import './CardStyles.css'; // Common styles for all cards

// You will need to ensure Chart.js components are registered globally in App.js or index.js
// Chart.js registration is already in App.js, so no need to register here again.

const ChartCard = ({ title, chartData, chartOptions }) => {
  return (
    <section className="chart-card card">
      <h2>{title}</h2>
      <div className="chart-container">
        <Line data={chartData} options={chartOptions} />
      </div>
    </section>
  );
};

export default ChartCard;
