import React from 'react';
import './CardStyles.css'; // Common styles for all cards

const SensorStatusCard = ({ latestData }) => {
  return (
    <section className="sensor-status card">
      <h2>Current Status</h2>
      <p>
        <strong>Soil Moisture:</strong> {latestData.soilMoisture !== null ? latestData.soilMoisture : 'N/A'}
      </p>
      <p>
        <strong>Pump Status:</strong> {latestData.pumpStatus}
      </p>
      <p>
        <strong>Temperature:</strong> {latestData.temperature !== null ? `${latestData.temperature}°C` : 'N/A'}
      </p>
      <p>
        <strong>Humidity:</strong> {latestData.humidity !== null ? `${latestData.humidity}%` : 'N/A'}
      </p>
      <p>
        <strong>Last Updated:</strong> {latestData.timestamp ? new Date(latestData.timestamp).toLocaleString() : 'N/A'}
      </p>
    </section>
  );
};

export default SensorStatusCard;
