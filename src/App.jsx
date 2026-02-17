import React, { useState, useEffect } from 'react';
import axios from 'axios';
import SearchBar from './components/SearchBar';
import ButtonPanel from './components/ButtonPanel';
import WeatherCard from './components/WeatherCard';
import './styles.css';

function App() {
  const [city, setCity] = useState(''); // Start empty
  const [weatherData, setWeatherData] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [activeTab, setActiveTab] = useState('current');
  const [selectedDate, setSelectedDate] = useState(new Date().toISOString().split('T')[0]);
  const [unit, setUnit] = useState('m'); // m = Metric, f = Fahrenheit, s = Scientific

  const API_KEY = import.meta.env.VITE_WEATHER_API_KEY;
  // Weatherstack free plan ONLY supports HTTP, not HTTPS.
  // Our proxy at /weather-api forwards to http://api.weatherstack.com
  // This avoids mixed content errors and CORS.
  const BASE_URL = '/weather-api';

  const fetchWeather = async (searchQuery) => {
    if (!searchQuery) return; // Don't fetch if no query

    setLoading(true);
    setError(null);
    setWeatherData(null);

    let endpoint = '/current';
    let params = {
      access_key: API_KEY,
      query: searchQuery,
      units: unit
    };

    if (activeTab === 'historical') {
      endpoint = '/historical';
      params.historical_date = selectedDate;
      params.hourly = 1;
    } else if (activeTab === 'forecast') {
      endpoint = '/forecast';
      params.forecast_days = 7;
      params.hourly = 1;
    }

    try {
      const response = await axios.get(`${BASE_URL}${endpoint}`, { params });

      if (response.data.error) {
        // Handle specific API errors
        // Code 105: Base Plan Subscription - HTTPS Not Supported or Feature Not Supported
        if (response.data.error.code === 105) {
          setError(`Plan Restriction: ${response.data.error.info}. You likely need to upgrade your plan for HTTPS or this feature.`);
        } else {
          setError(`API Error: ${response.data.error.info} (Code: ${response.data.error.code})`);
        }
      } else if (response.data.success === false) {
        // Sometimes error is nested differently or success flag is false
        setError('API Request failed. Please check your plan limitations.');
      } else {
        setWeatherData(response.data);
        updateBackground(response.data);
        // If it was a lat/lon query, update city name display logic if needed (handled by API response usually)
      }
    } catch (err) {
      console.error("Full error:", err);
      if (err.response && err.response.status === 400 && (activeTab === 'forecast' || activeTab === 'historical')) {
        setError("Upgrade the API key plan");
      } else {
        setError(`Network/Server Error: ${err.message}. Ensure you are not blocked by CORS or network issues.`);
      }
    } finally {
      setLoading(false);
    }
  };

  const updateBackground = (data) => {
    let weatherCode = 113; // default sunny

    if (data.current) {
      weatherCode = data.current.weather_code;
    } else if (data.historical) {
      const date = Object.keys(data.historical)[0];
      weatherCode = data.historical[date].hourly[0].weather_code;
    } else if (data.forecast) {
      const date = Object.keys(data.forecast)[0];
      weatherCode = data.forecast[date].hourly[0].weather_code;
    }

    // Simple mapping based on weather codes
    const body = document.body;
    body.className = ''; // reset

    // Codes can be found in documentation. Simplified logic:
    if (weatherCode === 113) body.classList.add('sunny');
    else if ([116, 119, 122].includes(weatherCode)) body.classList.add('cloudy');
    else if ([176, 266, 296, 308].includes(weatherCode)) body.classList.add('rainy');
    else if ([227, 230, 323, 326].includes(weatherCode)) body.classList.add('snowy');
    else body.classList.add('cloudy'); // default fallback
  };

  const handleSearch = (newCity) => {
    setCity(newCity);
    fetchWeather(newCity);
  };

  const toggleUnit = () => {
    setUnit(prev => prev === 'm' ? 'f' : 'm');
  };

  // Initial Location Detection
  useEffect(() => {
    if (navigator.geolocation) {
      setLoading(true); // Show loading while getting location
      navigator.geolocation.getCurrentPosition(
        (position) => {
          const { latitude, longitude } = position.coords;
          const query = `${latitude},${longitude}`;
          setCity(query); // Update city state to lat,lon
          fetchWeather(query);
        },
        (err) => {
          console.error("Geolocation error:", err);
          setLoading(false);
          // Fallback: Do nothing, let user search
          setError("Location access denied. Please search for a city.");
        }
      );
    } else {
      setError("Geolocation is not supported by this browser. Please search for a city.");
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []); // Run only once on mount

  // Re-fetch when dependencies change (except city, which is handled manually or by search)
  useEffect(() => {
    // Only re-fetch if we already have a city/query set (from initial load or search)
    if (city) {
      fetchWeather(city);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [activeTab, selectedDate, unit]); // Don't include city here to avoid double fetch on mount logic overlap

  return (
    <div className="app-container">
      <h1>Weather App</h1>

      <SearchBar onSearch={handleSearch} />

      <ButtonPanel
        activeTab={activeTab}
        setActiveTab={setActiveTab}
        selectedDate={selectedDate}
        onDateChange={setSelectedDate}
      />

      {loading && <div className="loading-spinner"></div>}

      {error && <div className="error-msg">{error}</div>}

      {!loading && !error && weatherData && (
        <WeatherCard
          data={weatherData}
          unit={unit === 'm' ? 'C' : 'F'}
          toggleUnit={toggleUnit}
          isForecast={activeTab === 'forecast'}
        />
      )}
    </div>
  );
}

export default App;
