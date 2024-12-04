import React from 'react';
import './StatusBox.css';

function StatusBox({ location }) {
  const getStatusFromLocation = (start_date, end_date) => {
    const today = new Date();

    // Convert start and end dates to Date objects
    const startDate = new Date(start_date);
    const endDate = new Date(end_date);

    // Check if the festival is currently ongoing
    if (today >= startDate && today <= endDate) {
      return '진행중';
    }

    // Check if the festival is D-DAY (starts or ends today)
    if (
      today.toDateString() === startDate.toDateString() ||
      today.toDateString() === endDate.toDateString()
    ) {
      return 'D-DAY';
    }

    // If the festival is in the past, it's ended
    if (today > endDate) {
      return '종료됨';
    }

    // Default case if none of the conditions match
    return '정보 없음';
  };

  const status = getStatusFromLocation(location.start_date, location.end_date);

  const getStatusStyle = (status) => {
    switch (status) {
      case '진행중':
        return { backgroundColor: '#2bd92b', color: '#fff' };
      case 'D-DAY':
        return { backgroundColor: '#ff74a9', color: '#fff' };
      case '종료됨':
        return { backgroundColor: '#9e9e9e', color: '#fff' };
      default:
        return { backgroundColor: '#f17f42', color: '#fff' }; // Default status box
    }
  };

  return (
    <div className="status-box" style={getStatusStyle(status)}>
      {status}
    </div>
  );
}

export default StatusBox;
