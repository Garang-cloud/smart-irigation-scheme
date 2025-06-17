import React from 'react';
import './CardStyles.css'; // Common styles for all cards

const PumpControlCard = ({ latestData, sendPumpCommand, cooldownRemaining }) => {
  const isPumpOn = latestData.pumpStatus === 'ON';
  const isCoolingDown = cooldownRemaining > 0;

  return (
    <section className="pump-control card">
      <h2>Pump Control</h2>
      {/* Automation Status (Placeholder for now, will be dynamic later) */}
      <p className="automation-status">
        <strong>Automation:</strong> {latestData.automationEnabled ? 'Active' : 'Inactive'}
      </p>

      <div className="pump-buttons">
        <button
          onClick={() => sendPumpCommand('TURN_PUMP_ON')}
          disabled={isPumpOn || isCoolingDown}
        >
          Turn Pump ON
        </button>
        <button
          onClick={() => sendPumpCommand('TURN_PUMP_OFF')}
          disabled={!isPumpOn || isCoolingDown}
        >
          Turn Pump OFF
        </button>
      </div>

      {isCoolingDown && (
        <p className="cooldown-message">
          Pump on cooldown: {cooldownRemaining}s remaining
        </p>
      )}
    </section>
  );
};

export default PumpControlCard;
