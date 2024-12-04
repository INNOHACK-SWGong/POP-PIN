// src/components/CalendarView/CalendarView.jsx
import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import CalendarComponent from '../calendarComponent/CalendarComponent';
import './CalendarView.css';

function CalendarView({ events }) {
  const [selectedDate, setSelectedDate] = useState(null);
  const [hoveredDate, setHoveredDate] = useState(null);
  const navigate = useNavigate();

  const handleEventClick = (event) => {
    navigate(`/detail/${event.id}`, { state: event });
  };

  const eventsOnSelectedDate = selectedDate
    ? events.filter((event) => {
        const startDate = new Date(event.start_date);
        const endDate = new Date(event.end_date);
        const selected = new Date(selectedDate);
        selected.setHours(0, 0, 0, 0);
        return selected >= startDate && selected <= endDate;
      })
    : [];

  const eventsOnHoveredDate = hoveredDate
    ? events.filter((event) => {
        const startDate = new Date(event.start_date);
        const endDate = new Date(event.end_date);
        const hovered = new Date(hoveredDate);
        hovered.setHours(0, 0, 0, 0);
        return hovered >= startDate && hovered <= endDate;
      })
    : [];

  return (
    <div className="calendar-view">
      <CalendarComponent
        events={events}
        selectedDate={selectedDate}
        setSelectedDate={setSelectedDate}
        hoveredDate={hoveredDate}
        setHoveredDate={setHoveredDate}
      />
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

      {/* Hover Popup */}
      {/* {hoveredDate && (
        <div className="hover-popup">
          <h4>{hoveredDate.toLocaleDateString('ko-KR')}</h4>
          {eventsOnHoveredDate.length > 0 ? (
            <ul>
              {eventsOnHoveredDate.map((event, index) => (
                <li key={index}>{event.title}</li>
              ))}
            </ul>
          ) : (
            <p>이 날에 해당하는 축제가 없습니다.</p>
          )}
        </div>
      )} */}
    </div>
  );
}

export default CalendarView;
