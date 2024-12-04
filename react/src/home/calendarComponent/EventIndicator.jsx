// src/components/CalendarComponent/EventIndicator.jsx
import React from 'react';
import './EventIndicator.css';

function EventIndicator({ count }) {
  return <div className="event-indicator">{count}</div>;
}

export default EventIndicator;
