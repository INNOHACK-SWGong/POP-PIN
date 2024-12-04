import React from 'react';
import './LocationCard.css';

function LocationCard({ location, onClick }) {
  return (
    <div className="location-card" onClick={onClick}>
      <h2 className="card-title">{location['축제명']}</h2>
      <p className="card-dates">
        {location['축제시작일자']} ~ {location['축제종료일자']}
      </p>
      <p className="card-status">{location.status}</p>
      <p className="card-address">
        {location['소재지도로명주소'] || location['소재지지번주소']}
      </p>
    </div>
  );
}

export default LocationCard;
