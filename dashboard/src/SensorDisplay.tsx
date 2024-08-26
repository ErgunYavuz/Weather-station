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

ChartJS.register(
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  Title,
  Tooltip,
  Legend
);

interface SensorData {
  temperature: number;
  humidity: number;
  pressure: number;
  timestamp: string;
}

//change to esp IP
const ESP32_API_URL = 'http://x/api/sensor-data';
//const ESP32_API_URL = 'http://localhost:3001/api/sensor-data';

const SensorDisplay: React.FC = () => {
  const [sensorData, setSensorData] = useState<SensorData[]>([]);
  const [error, setError] = useState<string | null>(null);


  const fetchSensorData = async () => {
    try {
      const response = await axios.get<SensorData>(ESP32_API_URL, {
      });
      setSensorData(prevData => [...prevData, response.data].slice(-20)); // Keep last 20 data points
      setError(null);
    } catch (err) {
      console.error('Error fetching sensor data:', err);
      // If it's an Axios error
      if (axios.isAxiosError(err)) {
        
        //server responded with an error
        if (err.response) {
          setError(`Server error: ${err.response.status} - ${err.response.data.error || err.response.data}`);
        
          // The request was made but no response was received
        } else if (err.request) {
          setError('No response received from server');
        
          // Something else happened
        } else {
          setError(`Error: ${err.message}`);
        }
      } else {
        // For non-Axios errors
        setError('An unexpected error occurred');
      }
    }
  };

  useEffect(() => {
    fetchSensorData();
    const interval = setInterval(fetchSensorData, 10000); // Fetch every 5 seconds
    return () => clearInterval(interval);
  }, []);

  const chartOptions = {
    responsive: true,
    plugins: {
      legend: {
        position: 'top' as const,
      },
      title: {
        display: true,
        text: 'ESP32 Sensor Data',
      },
    },
  };

  const createChartData = (label: string, data: number[]) => ({
    labels: sensorData.map(d => new Date(d.timestamp).toLocaleTimeString()),
    datasets: [
      {
        label,
        data,
        borderColor: 'rgb(75, 192, 192)',
        tension: 0.1,
      },
    ],
  });

  if (error) {
    return <div>Error: {error}</div>;
  }

  if (sensorData.length === 0) {
    return <div>Loading...</div>;
  }

  return (
    <div>
      <h1>ESP32 Sensor Data</h1>
      <div style={{ width: '600px', marginBottom: '20px' }}>
        <Line options={chartOptions} data={createChartData('Temperature (°C)', sensorData.map(d => d.temperature))} />
      </div>
      <div style={{ width: '600px', marginBottom: '20px' }}>
        <Line options={chartOptions} data={createChartData('Humidity (%)', sensorData.map(d => d.humidity))} />
      </div>
      <div style={{ width: '600px', marginBottom: '20px' }}>
        <Line options={chartOptions} data={createChartData('Pressure (hPa)', sensorData.map(d => d.pressure))} />
      </div>
    </div>
  );
};

export default SensorDisplay;