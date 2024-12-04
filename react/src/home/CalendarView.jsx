import React, { useState } from 'react';
import Calendar from 'react-calendar';
import { useNavigate } from 'react-router-dom';
import './CalendarView.css';

function CalendarView({ events }) {
  const [selectedDate, setSelectedDate] = useState(null);
  const [hoveredDate, setHoveredDate] = useState(null);
  const navigate = useNavigate();

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

  const handleEventClick = (event) => {
    navigate(`/detail/${event.id}`, { state: event });
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
            ? `${selectedDate.getFullYear()}년 ${
                selectedDate.getMonth() + 1
              }월 ${selectedDate.getDate()}일 축제`
            : '날짜를 선택해주세요'}
        </h4>

        {eventsOnSelectedDate.length > 0 ? (
          <div className="event-cards">
            {eventsOnSelectedDate.map((event) => (
              <div
                key={event.id}
                className="event-card"
                onClick={() => handleEventClick(event)}
              >
                <div className="event-details">
                  <h5 className="event-title">{event.title}</h5>
                  <p className="event-dates">
                    {event.start_date} ~ {event.end_date}
                  </p>
                  <p className="event-location">{event.location}</p>
                </div>
                <img
                  src={event.image_url}
                  alt={event.title}
                  className="event-image"
                />
              </div>
            ))}
          </div>
        ) : (
          <p>이 날짜에 해당하는 축제가 없습니다.</p>
        )}
      </div>
    </div>
  );
}

export default CalendarView;
