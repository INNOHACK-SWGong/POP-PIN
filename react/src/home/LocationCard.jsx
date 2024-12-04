import React from 'react';
import './LocationCard.css';

function LocationCard({ location, onClick }) {
  return (
    <div className="location-card" onClick={onClick}>
      <h2 className="card-title">{location['관광지명']}</h2>
      <p className="card-address">
        {location['소재지도로명주소'] || location['소재지지번주소']}
      </p>
      <p className="card-distance">거리: {location.distance.toFixed(2)} km</p>
      <p className="card-description">{location['관광지소개']}</p>
    </div>
  );
}

export default LocationCard;
