// src/components/CalendarComponent/EventIndicator.jsx
import React from 'react';
import './EventIndicator.css';

function EventIndicator({ count }) {
  const clampedCount = Math.max(0, Math.min(count, 10));

  // HSL
  const hue = 21;
  const saturation = 86;
  // count에 따라 Lightness를 60%에서 30%로 감소
  const lightness = 100 - (clampedCount / 10) * 40;

  const backgroundColor = `hsl(${hue}, ${saturation}%, ${lightness}%)`;
  const color = `hsl(${hue}, ${saturation}%, ${100 - lightness}%)`;

  return (
    <div
      className="event-indicator"
      style={{ backgroundColor, color }}
      title={`${count}개의 이벤트`}
    >
      {count}
    </div>
  );
}

export default EventIndicator;
