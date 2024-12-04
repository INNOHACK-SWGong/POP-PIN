import React, { useState } from 'react';
import Calendar from 'react-calendar';
import './CalendarView.css';

function CalendarView({ events }) {
  const [selectedDate, setSelectedDate] = useState(null);
  const [hoveredDate, setHoveredDate] = useState(null);

  const getTodayDate = () => {
    const today = new Date();
    return new Date(today.getFullYear(), today.getMonth(), today.getDate());
  };

  const tileContent = ({ date }) => {
    const dailyEvents = events.filter((event) => {
      const startDate = new Date(event.start_date);
      const endDate = new Date(event.end_date);
      return date >= startDate && date <= endDate;
    });

    return dailyEvents.length > 0 ? (
      <div
        className={`event-marker ${
          date < getTodayDate() ? 'past-event' : 'upcoming-event'
        }`}
        onMouseEnter={() => setHoveredDate(date)}
        onMouseLeave={() => setHoveredDate(null)}
      >
        {dailyEvents.length}
      </div>
    ) : null;
  };

  const handleDateClick = (date) => {
    setSelectedDate(date);
  };

  const eventsOnSelectedDate = selectedDate
    ? events.filter((event) => {
        const startDate = new Date(event.start_date);
        const endDate = new Date(event.end_date);
        return selectedDate >= startDate && selectedDate <= endDate;
      })
    : [];

  return (
    <div className="calendar-view">
      <div className="calendar-container">
        <Calendar
          tileContent={tileContent}
          onClickDay={(date) => handleDateClick(date)}
        />
        {hoveredDate && (
          <div className="hover-popup">
            <h4>{hoveredDate.toDateString()}</h4>
            {events.filter((event) => {
              const startDate = new Date(event.start_date);
              const endDate = new Date(event.end_date);
              return hoveredDate >= startDate && hoveredDate <= endDate;
            }).length > 0 ? (
              <ul>
                {events
                  .filter((event) => {
                    const startDate = new Date(event.start_date);
                    const endDate = new Date(event.end_date);
                    return hoveredDate >= startDate && hoveredDate <= endDate;
                  })
                  .map((event, index) => (
                    <li key={index}>{event.title}</li>
                  ))}
              </ul>
            ) : (
              <p>이 날에 해당하는 축제가 없습니다.</p>
            )}
          </div>
        )}
      </div>
      <div className="selected-events-container">
        <h4>
          {selectedDate
            ? `${selectedDate.toDateString()} 축제`
            : '날짜를 선택해주세요'}
        </h4>
        {eventsOnSelectedDate.length > 0 ? (
          <ul>
            {eventsOnSelectedDate.map((event, index) => (
              <li key={index}>
                <strong>{event.title}</strong> - {event.end_date}까지
              </li>
            ))}
          </ul>
        ) : (
          <p>이 날짜에 해당하는 축제가 없습니다.</p>
        )}
      </div>
    </div>
  );
}

export default CalendarView;
