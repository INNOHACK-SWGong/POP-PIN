import React from 'react';
import './FestivalCard.css';

function FestivalCard({ festival, navigate }) {
  const { title, start_date, end_date, location, image_url, status, id } =
    festival;

  const today = new Date();
  const getStatus = () => {
    const startDate = new Date(start_date);
    const endDate = new Date(end_date);

    if (today > endDate) {
      return { status: '종료됨', statusClass: '종료됨' };
    } else if (today >= startDate) {
      const differenceInDays = Math.ceil(
        (endDate - today) / (1000 * 60 * 60 * 24)
      );
      return { status: '진행 중', statusClass: '진행중' };
    } else {
      const differenceInDays = Math.ceil(
        (startDate - today) / (1000 * 60 * 60 * 24)
      );
      return { status: `시작 D-${differenceInDays}`, statusClass: 'start' };
    }
  };
  const { status: festivalStatus, statusClass } = getStatus();

  const handleDetailsClick = () => {
    navigate(`/detail/${id}`);
  };

  return (
    <div className="festival-card">
      <img
        src={image_url}
        alt={title}
        className="festival-card-image"
        loading="lazy"
      />
      <div className="festival-card-details">
        <h2 className="festival-card-title">{title}</h2>
        <p className="festival-card-dates">
          {start_date} ~ {end_date}
        </p>
        <div className="festival-card-status-wrapper">
          <p className={`festival-card-status ${statusClass}`}>
            {festivalStatus}
          </p>
        </div>
        <p className="festival-card-location">
          <strong>위치:</strong> {location || '정보 없음'}
        </p>
        <button className="details-button" onClick={handleDetailsClick}>
          상세 정보 보기
        </button>
      </div>
    </div>
  );
}

export default FestivalCard;
