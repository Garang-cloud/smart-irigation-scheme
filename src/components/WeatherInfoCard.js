import React from 'react';
import './CardStyles.css'; // Common styles for all cards

const WeatherInfoCard = ({ weatherData }) => {
  const iconUrl = weatherData.icon
    ? `http://openweathermap.org/img/wn/${weatherData.icon}@2x.png`
    : 'https://placehold.co/70x70/E0E0E0/A0A0A0?text=No+Icon'; // Placeholder if no icon

  return (
    <section className="weather-info card">
      <h2>Current Weather</h2>
      {weatherData.city && weatherData.temperature !== 'N/A' ? (
        <div className="weather-details">
          <p>
            <strong>Location:</strong> {weatherData.city}
          </p>
          <img src={iconUrl} alt={weatherData.description} className="weather-icon" onError={(e) => { e.target.onerror = null; e.target.src = 'https://placehold.co/70x70/E0E0E0/A0A0A0?text=Icon+Error'; }} />
          <p>
            <strong>Temp:</strong> {weatherData.temperature}°C
          </p>
          <p>
            <strong>Condition:</strong> {weatherData.description}
          </p>
          <p>
            <strong>Humidity:</strong> {weatherData.humidity}%
          </p>
          <p>
            <strong>Wind:</strong> {weatherData.wind_speed} m/s
          </p>
          <p className="last-updated-weather">
            Last Updated: {weatherData.timestamp ? new Date(weatherData.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', second: '2-digit' }) : 'N/A'}
          </p>
        </div>
      ) : (
        <p>Weather data not available. Ensure backend weather API is configured and running.</p>
      )}
    </section>
  );
};

export default WeatherInfoCard;
