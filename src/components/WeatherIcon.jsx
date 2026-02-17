import React from 'react';

const WeatherIcon = ({ code, isDay }) => {
    // Mapping logic based on Weatherstack codes (simplified)
    // Codes: 113 (Sunny), 116-122 (Cloudy), 176+ (Rain/Snow)

    let iconType = 'sunny';

    if (code === 113) iconType = 'sunny';
    else if ([116, 119, 122].includes(code)) iconType = 'cloudy';
    else if ([176, 266, 296, 308, 353, 356, 359].includes(code)) iconType = 'rainy';
    else if ([227, 230, 323, 326, 329, 332, 338].includes(code)) iconType = 'snowy';
    else if ([200, 386, 389].includes(code)) iconType = 'stormy';
    else iconType = 'cloudy'; // fallback

    return (
        <div className={`weather-icon-container ${iconType}`}>
            {iconType === 'sunny' && (
                <div className="glass-icon sun">
                    <div className="rays"></div>
                </div>
            )}

            {iconType === 'cloudy' && (
                <div className="glass-icon cloud-group">
                    <div className="glass-cloud small"></div>
                    <div className="glass-cloud large"></div>
                </div>
            )}

            {iconType === 'rainy' && (
                <div className="glass-icon cloud-rain">
                    <div className="glass-cloud large gray"></div>
                    <div className="rain-drops">
                        <span></span><span></span><span></span>
                    </div>
                </div>
            )}

            {iconType === 'snowy' && (
                <div className="glass-icon cloud-snow">
                    <div className="glass-cloud large white"></div>
                    <div className="snow-flakes">
                        <span>❄</span><span>❄</span>
                    </div>
                </div>
            )}

            {iconType === 'stormy' && (
                <div className="glass-icon cloud-storm">
                    <div className="glass-cloud large dark"></div>
                    <div className="lightning">⚡</div>
                </div>
            )}
        </div>
    );
};

export default WeatherIcon;
