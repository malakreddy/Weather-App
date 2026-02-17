import React from 'react';
import WeatherIcon from './WeatherIcon';

const WeatherCard = ({ data, unit, toggleUnit, isForecast }) => {
    if (!data) return null;

    const {
        current,
        location,
        forecast,
        historical
    } = data;

    // Handle different data structures based on API response
    // Priority: Current -> Historical -> Forecast (for main display)
    let weatherDetails = current;
    if (!weatherDetails && historical) {
        const dates = Object.keys(historical);
        if (dates.length > 0) {
            // specific logic: use 12:00 PM (index 4 assuming 3-hourly) or just first available
            // The API returns 'hourly' array. Let's take the middle of the day or first.
            const dayData = historical[dates[0]];
            weatherDetails = dayData.hourly[Math.floor(dayData.hourly.length / 2)] || dayData.hourly[0];
            // Historical top-level doesn't have temperature, it's in hourly or avgtemp in date object
        }
    } else if (!weatherDetails && forecast) {
        const dates = Object.keys(forecast);
        if (dates.length > 0) {
            const dayData = forecast[dates[0]];
            weatherDetails = dayData.hourly[Math.floor(dayData.hourly.length / 2)] || dayData.hourly[0];
        }
    }

    // Create a display object to normalize data
    const displayData = {
        temp: current ? current.temperature : (weatherDetails?.temperature || 0),
        desc: current ? current.weather_descriptions[0] : (weatherDetails?.weather_descriptions[0] || ''),
        icon: current ? current.weather_icons[0] : (weatherDetails?.weather_icons[0] || ''),
        code: current ? current.weather_code : (weatherDetails?.weather_code || 113), // Add code for mapping
        humidity: current ? current.humidity : (weatherDetails?.humidity || 0),
        wind: current ? current.wind_speed : (weatherDetails?.wind_speed || 0),
        time: location?.localtime || '',
        name: location?.name || '',
        country: location?.country || ''
    };

    return (
        <div className="weather-card">
            <div className="weather-header">
                <h2 className="location-name">{displayData.name}, {displayData.country}</h2>
                <p className="location-time">{displayData.time}</p>

                <div className="weather-main">
                    {/* Replaced generic img with custom Glass Icon */}
                    <WeatherIcon code={displayData.code} />

                    <div className="temp-container">
                        <div
                            className="temp-value"
                            onClick={toggleUnit}
                            title="Click to toggle Unit"
                        >
                            {displayData.temp}°{unit}
                        </div>
                        <div className="weather-desc">{displayData.desc}</div>
                    </div>
                </div>
            </div>

            <div className="weather-details">
                <div className="detail-item">
                    <span className="detail-label">Humidity</span>
                    <span className="detail-value">{displayData.humidity}%</span>
                </div>
                <div className="detail-item">
                    <span className="detail-label">Wind Speed</span>
                    <span className="detail-value">{displayData.wind} km/h</span>
                </div>
                {/* Add more details as needed */}
            </div>

            {/* Render Forecast List if available and in forecast mode */}
            {isForecast && forecast && (
                <div className="forecast-container">
                    <h3>7-Day Forecast</h3>
                    <div className="forecast-scroll">
                        {Object.entries(forecast).map(([date, dayData]) => (
                            <div key={date} className="forecast-item">
                                <p className="forecast-day">{date}</p>
                                <p className="forecast-temp">{dayData.avgtemp || dayData.maxtemp}°{unit}</p>
                                <small>{dayData.astro?.sunrise}</small>
                            </div>
                        ))}
                    </div>
                </div>
            )}
        </div>
    );
};

export default WeatherCard;
