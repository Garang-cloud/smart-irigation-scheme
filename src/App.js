import React, { useState, useEffect } from 'react';
import axios from 'axios';

import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  Title,
  Tooltip,
  Legend,
} from 'chart.js';
import { BrowserRouter as Router, Routes, Route, Link, Navigate } from 'react-router-dom';

// NEW: Import AuthProvider, useAuth, and LoginPage
import { AuthProvider, useAuth } from './context/AuthContext';
import LoginPage from './components/LoginPage';

import './App.css'; // Main app styles
// Import new modular components
import SensorStatusCard from './components/SensorStatusCard';
import PumpControlCard from './components/PumpControlCard';
import WeatherInfoCard from './components/WeatherInfoCard';
import ChartCard from './components/ChartCard';
import AboutUs from './components/AboutUs'; // Existing AboutUs component

// Register Chart.js components globally (as they are used by ChartCard)
ChartJS.register(
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  Title,
  Tooltip,
  Legend
);

const BACKEND_URL = 'https://smartbackend-ryil.onrender.com';

// --- ProtectedRoute Component ---
// This component guards routes, redirecting to login if not authenticated
const ProtectedRoute = ({ children }) => {
  const { isAuthenticated, loading } = useAuth();

  if (loading) {
    return <div className="loading-state">Loading authentication...</div>;
  }

  if (!isAuthenticated) {
    return <Navigate to="/login" replace />;
  }

  return children;
};

// --- Dashboard Component ---
// All state management for dashboard data remains here
const Dashboard = () => {
  const { loading:authLoading } = useAuth(); 
  const [loadingDashboard, setLoadingDashboard] = useState(true); // Use auth loading state
  
  const [latestData, setLatestData] = useState({
    soilMoisture: 'N/A',
    pumpStatus: 'OFF',
    temperature: 'N/A',
    humidity: 'N/A',
    timestamp: null,
    lastPumpCommandTime: 0,
    pumpCooldownSeconds: 0,
    automationEnabled: false, // Placeholder, will be dynamic later
  });
  const [historyData, setHistoryData] = useState([]);
  const [weatherData, setWeatherData] = useState({
    temperature: 'N/A',
    description: 'N/A',
    icon: null,
    city: 'N/A',
    humidity: 'N/A', // Ambient humidity from weather API
    wind_speed: 'N/A',
    timestamp: null
  });
  // const [loadingDashboard, setLoadingDashboard] = useState(true); // Renamed to avoid confusion with auth loading
  const [error, setError] = useState(null);
  const [cooldownRemaining, setCooldownRemaining] = useState(0);

  // Data fetching functions
  const fetchLatestData = async () => {
    try {
      const response = await axios.get(`${BACKEND_URL}/api/data/latest`);
      setLatestData(response.data);
    } catch (err) {
      console.error("Error fetching latest sensor data:", err);
      setError("Failed to fetch latest sensor data. Please ensure backend is running and you are logged in.");
    }
  };

  const fetchHistoryData = async () => {
    try {
      const response = await axios.get(`${BACKEND_URL}/api/data/history`);
      setHistoryData(response.data);
    } catch (err) {
      console.error("Error fetching history data:", err);
      setError("Failed to fetch historical data. Please ensure backend is running and you are logged in.");
    } finally {
      setLoadingDashboard(false);
    }
  };

  const fetchWeatherData = async () => {
    try {
      const response = await axios.get(`${BACKEND_URL}/api/weather/latest`);
      setWeatherData(response.data);
    } catch (err) {
      console.error("Error fetching weather data:", err);
      // Don't set global error for weather, as sensor data is primary
    }
  };

  // Initial fetch and polling setup
  useEffect(() => {
    fetchLatestData();
    fetchHistoryData();
    fetchWeatherData(); // Initial weather fetch

    const intervalId = setInterval(() => {
      fetchLatestData();
      fetchHistoryData();
      // Weather data typically updates less frequently, e.g., every 10-15 minutes.
      // You might want a separate, less frequent interval for weather.
      // For now, keeping it at 5s for quick testing.
      fetchWeatherData();
    }, 5000);

    return () => clearInterval(intervalId);
  }, []);

  // Cooldown timer effect for pump
  useEffect(() => {
    let timer;
    if (latestData.lastPumpCommandTime && latestData.pumpCooldownSeconds > 0) {
      const startTime = latestData.lastPumpCommandTime;
      const cooldownDurationMs = latestData.pumpCooldownSeconds * 1000;

      const updateCooldown = () => {
        const elapsed = Date.now() - startTime;
        const remaining = Math.max(0, cooldownDurationMs - elapsed);
        setCooldownRemaining(Math.ceil(remaining / 1000));

        if (remaining <= 0) {
          clearInterval(timer);
        }
      };

      updateCooldown(); // Initial update
      timer = setInterval(updateCooldown, 1000); // Update every second

    } else {
      setCooldownRemaining(0);
    }
    return () => clearInterval(timer);
  }, [latestData.lastPumpCommandTime, latestData.pumpCooldownSeconds]);

  // Function to send pump control commands
  const sendPumpCommand = async (action) => {
    try {
      const response = await axios.post(`${BACKEND_URL}/api/command`, { action });
      if (response.data.success) {
        alert(`Command '${action}' sent successfully!`); // Reverted to native alert()
        fetchLatestData(); // Re-fetch latest data to update pump status and cooldown
      } else {
        alert(`Failed to send command: ${response.data.message}`); // Reverted to native alert()
      }
    } catch (err) {
      console.error("Error sending command:", err);
      alert("Failed to send command due to network error. Check backend and login status."); // Reverted to native alert()
    }
  };

  // Chart Data and Options for Individual Graphs
  const timeLabels = historyData.map(d => new Date(d.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', second: '2-digit' }));

  const baseChartOptions = {
    responsive: true,
    maintainAspectRatio: false,
    plugins: {
      legend: { position: 'top', labels: { font: { size: 14, family: 'Jost, sans-serif', }, color: '#333', } },
      title: { display: false, }, // Title handled by ChartCard prop
      tooltip: {
        mode: 'index', intersect: false,
        callbacks: {
          label: function(context) {
            let label = context.dataset.label || '';
            if (label) { label += ': '; }
            if (context.parsed.y !== null) {
              if (label.includes('Moisture')) { label += context.parsed.y + ' (Lower = Wetter)'; }
              else if (label.includes('Temperature')) { label += context.parsed.y + '°C'; }
              else if (label.includes('Humidity')) { label += context.parsed.y + '%'; }
              else { label += context.parsed.y; }
            }
            return label;
          }
        }
      }
    },
    scales: {
      x: { title: { display: true, text: 'Time', font: { size: 16, family: 'Jost, sans-serif', weight: 'bold', }, color: '#333', }, ticks: { color: '#555', font: { family: 'Jost, sans-serif', } }, grid: { display: true, color: 'rgba(0, 0, 0, 0.05)', } },
      y: { title: { display: true, text: 'Value', font: { size: 16, family: 'Jost, sans-serif', weight: 'bold', }, color: '#333', }, ticks: { color: '#555', font: { family: 'Jost, sans-serif', } }, grid: { display: true, color: 'rgba(0, 0, 0, 0.05)', }, beginAtZero: false, },
    },
  };

  const soilMoistureChartData = {
    labels: timeLabels,
    datasets: [
      { label: 'Soil Moisture', data: historyData.map(d => d.soilMoisture), fill: false, borderColor: 'rgb(75, 192, 192)', backgroundColor: 'rgba(75, 192, 192, 0.2)', tension: 0.3, pointRadius: 5, pointBackgroundColor: 'rgb(75, 192, 192)', pointBorderColor: '#fff', pointHoverRadius: 7, pointHoverBackgroundColor: 'rgb(75, 192, 192)', pointHoverBorderColor: 'rgba(220,220,220,1)', },
    ],
  };
  const soilMoistureChartOptions = { ...baseChartOptions, scales: { ...baseChartOptions.scales, y: { ...baseChartOptions.scales.y, title: { ...baseChartOptions.scales.y.title, text: 'Moisture Value (Lower = Wetter)', } } } };

  const temperatureChartData = {
    labels: timeLabels,
    datasets: [
      { label: 'Temperature (°C)', data: historyData.map(d => d.temperature), fill: false, borderColor: 'rgb(255, 99, 132)', backgroundColor: 'rgba(255, 99, 132, 0.2)', tension: 0.3, pointRadius: 5, pointBackgroundColor: 'rgb(255, 99, 132)', pointBorderColor: '#fff', pointHoverRadius: 7, pointHoverBackgroundColor: 'rgb(255, 99, 132)', pointHoverBorderColor: 'rgba(220,220,220,1)', },
    ],
  };
  const temperatureChartOptions = { ...baseChartOptions, scales: { ...baseChartOptions.scales, y: { ...baseChartOptions.scales.y, title: { ...baseChartOptions.scales.y.title, text: 'Temperature (°C)', } } } };

  const humidityChartData = {
    labels: timeLabels,
    datasets: [
      { label: 'Humidity (%)', data: historyData.map(d => d.humidity), fill: false, borderColor: 'rgb(54, 162, 235)', backgroundColor: 'rgba(54, 162, 235, 0.2)', tension: 0.3, pointRadius: 5, pointBackgroundColor: 'rgb(54, 162, 235)', pointBorderColor: '#fff', pointHoverRadius: 7, pointHoverBackgroundColor: 'rgb(54, 162, 235)', pointHoverBorderColor: 'rgba(220,220,220,1)', },
    ],
  };
  const humidityChartOptions = { ...baseChartOptions, scales: { ...baseChartOptions.scales, y: { ...baseChartOptions.scales.y, title: { ...baseChartOptions.scales.y.title, text: 'Humidity (%)', } } } };


  if (loadingDashboard) return <div className="loading-state">Loading dashboard data...</div>;
  if (error) return <div className="error-state">Error: {error}</div>; // Use a specific error class

  return (
    <main>
      <div className="top-row-container">
        {/* Render new SensorStatusCard component */}
        <SensorStatusCard latestData={latestData} />

        {/* Render new PumpControlCard component */}
        <PumpControlCard
          latestData={latestData}
          sendPumpCommand={sendPumpCommand}
          cooldownRemaining={cooldownRemaining}
        />

        {/* Render new WeatherInfoCard component */}
        <WeatherInfoCard weatherData={weatherData} />
      </div>

      {/* Sensor History Charts Container */}
      <div className="history-charts-container">
        <ChartCard
          title="Soil Moisture Readings Over Time"
          chartData={soilMoistureChartData}
          chartOptions={soilMoistureChartOptions}
        />
        <ChartCard
          title="Temperature Readings Over Time"
          chartData={temperatureChartData}
          chartOptions={temperatureChartOptions}
        />
        <ChartCard
          title="Humidity Readings Over Time"
          chartData={humidityChartData}
          chartOptions={humidityChartOptions}
        />
      </div>
    </main>
  );
};

// --- Main App Component (Updated with AuthProvider and Protected Routes) ---
function App() {
  const { isAuthenticated, loading, logout } = useAuth();

  // If AuthContext is still loading, show a global loading indicator
  if (loading) {
    return <div className="app-global-loading">Loading application authentication...</div>;
  }

  return (
    <div className="App">
      <header className="App-header">
        <h1>Smart Irrigation Dashboard</h1>
        <nav className="main-nav">
          <Link to="/">Dashboard</Link>
          <Link to="/about">About Us</Link>
          {isAuthenticated ? (
            <button onClick={logout} className="nav-button logout-button">Logout</button>
          ) : (
            <Link to="/login" className="nav-button">Login</Link>
          )}
        </nav>
      </header>
      <Routes>
        {/* Public route for login */}
        <Route path="/login" element={<LoginPage />} />
        {/* Protected routes */}
        <Route path="/" element={<ProtectedRoute><Dashboard /></ProtectedRoute>} />
        <Route path="/about" element={<ProtectedRoute><AboutUs /></ProtectedRoute>} />
        {/* Redirect any unmatched routes to login if not authenticated, or to dashboard if authenticated */}
        <Route path="*" element={<Navigate to={isAuthenticated ? '/' : '/login'} replace />} />
      </Routes>
    </div>
  );
}

// Wrapper for the entire application to provide AuthContext
const AppWrapper = () => (
  <Router>
    <AuthProvider>
      <App />
    </AuthProvider>
  </Router>
);

export default AppWrapper;

