// src/components/festivalCard/FestivalCard.jsx
import React from 'react';
import './FestivalCard.css';
import { useNavigate } from 'react-router-dom';

function FestivalCard({ festival }) {
  const navigate = useNavigate();

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

  const handleDetailsClick = () => {
    // 상세 페이지로 이동할 때, 축제 데이터를 URL 파라미터로 전달
    navigate(
      `/detail?festival=${encodeURIComponent(JSON.stringify(festival))}`
    );
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
        <button
          className="details-button"
          onClick={handleDetailsClick}
          aria-label={`${title} 상세 정보 보기`}
        >
          상세 정보 보기
        </button>
      </div>
    </div>
  );
}

export default FestivalCard;
