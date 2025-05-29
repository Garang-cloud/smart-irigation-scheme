import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { Line } from 'react-chartjs-2';
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
import { BrowserRouter as Router, Routes, Route, Link } from 'react-router-dom';

import './App.css';
import AboutUs from './components/AboutUs';

ChartJS.register(
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  Title,
  Tooltip,
  Legend
);

const BACKEND_URL = 'http://localhost:5000';

const Dashboard = () => {
  const [latestData, setLatestData] = useState({ soilMoisture: 'N/A', pumpStatus: 'OFF', temperature: 'N/A', humidity: 'N/A', timestamp: null });
  const [historyData, setHistoryData] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const fetchLatestData = async () => {
    try {
      const response = await axios.get(`${BACKEND_URL}/api/data/latest`);
      setLatestData(response.data);
    } catch (err) {
      console.error("Error fetching latest data:", err);
      setError("Failed to fetch latest data. Is backend running?");
    }
  };

  const fetchHistoryData = async () => {
    try {
      const response = await axios.get(`${BACKEND_URL}/api/data/history`);
      setHistoryData(response.data);
    } catch (err) {
      console.error("Error fetching history data:", err);
      setError("Failed to fetch historical data. Is backend running?");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchLatestData();
    fetchHistoryData();

    const intervalId = setInterval(() => {
      fetchLatestData();
      fetchHistoryData();
    }, 5000);

    return () => clearInterval(intervalId);
  }, []);

  const sendPumpCommand = async (action) => {
    try {
      const response = await axios.post(`${BACKEND_URL}/api/command`, { action });
      if (response.data.success) {
        alert(`Command '${action}' sent successfully!`);
        fetchLatestData();
      } else {
        alert(`Failed to send command: ${response.data.message}`);
      }
    } catch (err) {
      console.error("Error sending command:", err);
      alert("Failed to send command due to network error. Check backend.");
    }
  };

  const chartData = {
    labels: historyData.map(d => new Date(d.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', second: '2-digit' })),
    datasets: [
      {
        label: 'Soil Moisture',
        data: historyData.map(d => d.soilMoisture),
        fill: false,
        borderColor: 'rgb(75, 192, 192)',
        backgroundColor: 'rgba(75, 192, 192, 0.2)',
        tension: 0.3,
        pointRadius: 5,
        pointBackgroundColor: 'rgb(75, 192, 192)',
        pointBorderColor: '#fff',
        pointHoverRadius: 7,
        pointHoverBackgroundColor: 'rgb(75, 192, 192)',
        pointHoverBorderColor: 'rgba(220,220,220,1)',
        yAxisID: 'y',
      },
      {
        label: 'Temperature (°C)',
        data: historyData.map(d => d.temperature),
        fill: false,
        borderColor: 'rgb(255, 99, 132)',
        backgroundColor: 'rgba(255, 99, 132, 0.2)',
        tension: 0.3,
        yAxisID: 'y1',
        pointRadius: 5,
        pointBackgroundColor: 'rgb(255, 99, 132)',
        pointBorderColor: '#fff',
        pointHoverRadius: 7,
        pointHoverBackgroundColor: 'rgb(255, 99, 132)',
        pointHoverBorderColor: 'rgba(220,220,220,1)',
      },
      {
        label: 'Humidity (%)',
        data: historyData.map(d => d.humidity),
        fill: false,
        borderColor: 'rgb(54, 162, 235)',
        backgroundColor: 'rgba(54, 162, 235, 0.2)',
        tension: 0.3,
        yAxisID: 'y2',
        pointRadius: 5,
        pointBackgroundColor: 'rgb(54, 162, 235)',
        pointBorderColor: '#fff',
        pointHoverRadius: 7,
        pointHoverBackgroundColor: 'rgb(54, 162, 235)',
        pointHoverBorderColor: 'rgba(220,220,220,1)',
      },
    ],
  };

  const chartOptions = {
    responsive: true,
    maintainAspectRatio: false,
    plugins: {
      legend: {
        position: 'top',
        labels: {
          font: {
            size: 14,
            family: 'Inter, sans-serif',
          },
          color: '#333',
        }
      },
      title: {
        display: true,
        text: 'Farm Sensor Readings Over Time',
        font: {
          size: 18,
          family: 'Inter, sans-serif',
          weight: 'bold',
        },
        color: '#2C3E50',
      },
      tooltip: {
        mode: 'index',
        intersect: false,
        callbacks: {
          label: function(context) {
            let label = context.dataset.label || '';
            if (label) {
              label += ': ';
            }
            if (context.parsed.y !== null) {
              if (label.includes('Moisture')) {
                label += context.parsed.y + ' (Lower = Wetter)';
              } else if (label.includes('Temperature')) {
                label += context.parsed.y + '°C';
              } else if (label.includes('Humidity')) {
                label += context.parsed.y + '%';
              } else {
                label += context.parsed.y;
              }
            }
            return label;
          }
        }
      }
    },
    scales: {
      x: {
        title: {
          display: true,
          text: 'Time',
          font: {
            size: 16,
            family: 'Inter, sans-serif',
            weight: 'bold',
          },
          color: '#333',
        },
        ticks: {
          color: '#555',
          font: {
            family: 'Inter, sans-serif',
          }
        },
        grid: {
          display: true,
          color: 'rgba(0, 0, 0, 0.05)',
        }
      },
      y: {
        title: {
          display: true,
          text: 'Moisture Value (Lower = Wetter)',
          font: {
            size: 16,
            family: 'Inter, sans-serif',
            weight: 'bold',
          },
          color: '#333',
        },
        ticks: {
          color: '#555',
          font: {
            family: 'Inter, sans-serif',
          }
        },
        grid: {
          display: true,
          color: 'rgba(0, 0, 0, 0.05)',
        },
        beginAtZero: false,
      },
      y1: {
        type: 'linear',
        display: true,
        position: 'right',
        grid: {
          drawOnChartArea: false,
        },
        title: {
          display: true,
          text: 'Temperature (°C)',
          font: {
            size: 16,
            family: 'Inter, sans-serif',
            weight: 'bold',
          },
          color: 'rgb(255, 99, 132)',
        },
        ticks: {
          color: 'rgb(255, 99, 132)',
          font: {
            family: 'Inter, sans-serif',
          }
        },
        beginAtZero: false,
      },
      y2: {
        type: 'linear',
        display: true,
        position: 'left',
        grid: {
          drawOnChartArea: false,
        },
        title: {
          display: true,
          text: 'Humidity (%)',
          font: {
            size: 16,
            family: 'Inter, sans-serif',
            weight: 'bold',
          },
          color: 'rgb(54, 162, 235)',
        },
        ticks: {
          color: 'rgb(54, 162, 235)',
          font: {
            family: 'Inter, sans-serif',
          }
        },
        beginAtZero: false,
      },
    },
  };

  if (loading) return <div className="App">Loading dashboard...</div>;
  if (error) return <div className="App">Error: {error}</div>;

  return (
    <main>
      <div className="top-row-container">
        <section className="current-status card">
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

        <section className="control-panel card">
          <h2>Pump Control</h2>
          <button onClick={() => sendPumpCommand('TURN_PUMP_ON')} disabled={latestData.pumpStatus === 'ON'}>Turn Pump ON</button>
          <button onClick={() => sendPumpCommand('TURN_PUMP_OFF')} disabled={latestData.pumpStatus === 'OFF'}>Turn Pump OFF</button>
        </section>
      </div>

      <section className="history-chart card">
        <h2>Farm Sensor History</h2>
        <div style={{ height: '100%', width: '100%' }}>
          <Line data={chartData} options={chartOptions} />
        </div>
      </section>
    </main>
  );
};

function App() {
  return (
    <Router>
      <div className="App">
        <header className="App-header">
          <h1>Smart Irrigation Dashboard</h1>
          <nav className="main-nav">
            <Link to="/">Dashboard</Link>
            <Link to="/about">About Us</Link>
          </nav>
        </header>
        <Routes>
          <Route path="/" element={<Dashboard />} />
          <Route path="/about" element={<AboutUs />} />
        </Routes>
      </div>
    </Router>
  );
}

export default App;
