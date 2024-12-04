// src/components/CalendarComponent/CalendarComponent.jsx
import React from 'react';
import Calendar from 'react-calendar';
import './CalendarComponent.css';
import EventIndicator from './EventIndicator';

function CalendarComponent({
  events,
  selectedDate,
  setSelectedDate,
  hoveredDate,
  setHoveredDate,
}) {
  // 날짜 선택
  const handleDateChange = (date) => {
    setSelectedDate(date);
  };

  // 날짜 hover 처리
  const handleMouseOver = (date) => {
    setHoveredDate(date);
  };

  // 오늘 날짜 가져오기
  const getTodayDate = () => {
    const today = new Date();
    return new Date(today.getFullYear(), today.getMonth(), today.getDate());
  };

  const tileContent = ({ date, view }) => {
    if (view !== 'month') return null; // 월별 보기에서만 이벤트 표시

    // 해당 날짜에 이벤트가 있는지 확인
    const dailyEvents = events.filter((event) => {
      const startDate = new Date(event.start_date);
      const endDate = new Date(event.end_date);
      return date >= startDate && date <= endDate;
    });

    return dailyEvents.length > 0 ? (
      <EventIndicator count={dailyEvents.length} />
    ) : null;
  };

  return (
    <div className="calendar-container">
      <Calendar
        onChange={handleDateChange}
        value={selectedDate}
        tileContent={tileContent}
        onActiveStartDateChange={({ activeStartDate }) =>
          handleMouseOver(activeStartDate)
        }
        onMouseOver={({ activeStartDate }) => handleMouseOver(activeStartDate)}
        onMouseLeave={() => setHoveredDate(null)}
        locale="ko-KR" // 한국어 로케일 설정
        // minDate={getTodayDate()}
        tileClassName={({ date, view }) =>
          date.toDateString() === hoveredDate?.toDateString() ? 'hovered' : ''
        }
        formatShortWeekday={(locale, date) =>
          ['일', '월', '화', '수', '목', '금', '토'][date.getDay()]
        }
      />
    </div>
  );
}

export default CalendarComponent;
