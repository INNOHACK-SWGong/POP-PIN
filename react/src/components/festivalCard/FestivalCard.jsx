// src/components/festivalCard/FestivalCard.jsx
import React from 'react';
import './FestivalCard.css';

function FestivalCard({ festival, navigate }) {
  const {
    title,
    date,
    start_date,
    end_date,
    location,
    geocode_location,
    latitude,
    longitude,
    image_url,
    status,
    id,
  } = festival;
  // console.log(image_url);

  const handleDetailsClick = () => {
    // 상세 페이지로 이동할 때, 축제의 id를 URL 파라미터로 전달
    navigate(`/detail/${id}`);
  };

  return (
    <div className="festival-card">
      <img
        src={image_url}
        alt={title}
        className="festival-image"
        loading="lazy"
      />
      <div className="festival-details">
        <h2 className="festival-title">{title}</h2>
        <p className="festival-date">
          <strong>날짜:</strong> {date}
        </p>
        <p className="festival-location">
          <strong>위치:</strong> {location || '정보 없음'}
        </p>
        <p className="festival-status">
          <strong>상태:</strong> {status}
        </p>
        <button className="details-button" onClick={handleDetailsClick}>
          상세 정보 보기
        </button>
      </div>
    </div>
  );
}

export default FestivalCard;
