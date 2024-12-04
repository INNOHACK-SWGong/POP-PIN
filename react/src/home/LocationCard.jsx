import React from 'react';
import './LocationCard.css';

function LocationCard({ location, onClick }) {
  // 날짜 계산
  const currentDate = new Date();
  const endDate = new Date(location['축제종료일자']);
  const startDate = new Date(location['축제시작일자']);
  const dDay =
    endDate < currentDate
      ? '종료'
      : `D-${Math.ceil((startDate - currentDate) / (1000 * 60 * 60 * 24))}`;

  return (
    <div className="location-card" onClick={onClick}>
      <h2 className="card-title">{location['축제명']}</h2>
      <p className="card-address">
        {location['소재지도로명주소'] || location['소재지지번주소']}
      </p>
      <p className="card-date">
        {`시작일: ${location['축제시작일자']}`} |{' '}
        {`종료일: ${location['축제종료일자']}`}
      </p>
      <p className={`card-status ${dDay === '종료' ? 'ended' : 'active'}`}>
        {dDay}
      </p>
      <p className="card-distance">거리: {location.distance.toFixed(2)} km</p>
      <p className="card-description">{location['축제내용']}</p>
    </div>
  );
}

export default LocationCard;
