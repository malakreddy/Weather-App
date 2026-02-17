import React from 'react';

const ButtonPanel = ({ activeTab, setActiveTab, onDateChange, selectedDate }) => {
    return (
        <div className="button-panel">
            <button
                className={`glass-btn ${activeTab === 'current' ? 'active' : ''}`}
                onClick={() => setActiveTab('current')}
            >
                Current Weather
            </button>

            <button
                className={`glass-btn ${activeTab === 'forecast' ? 'active' : ''}`}
                onClick={() => setActiveTab('forecast')}
            >
                Future Forecast
            </button>

            <div className="date-picker-wrapper">
                <button
                    className={`glass-btn ${activeTab === 'historical' ? 'active' : ''}`}
                    onClick={() => setActiveTab('historical')}
                >
                    Past Weather
                </button>
                {activeTab === 'historical' && (
                    <input
                        type="date"
                        className="date-picker-input"
                        value={selectedDate}
                        onChange={(e) => onDateChange(e.target.value)}
                        max={new Date().toISOString().split('T')[0]}
                    />
                )}
            </div>
        </div>
    );
};

export default ButtonPanel;
