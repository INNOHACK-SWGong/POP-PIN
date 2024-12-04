import React from 'react';
import './LocationCard.css';

function LocationCard({ location, onClick }) {
  return (
    <div className="location-card" onClick={onClick}>
      <h2 className="card-title">{location.title}</h2>
      <p className="card-dates">
        {location.start_date} ~ {location.end_date}
      </p>
      <p className="card-status">{location.status}</p>
      <p className="card-address">{location.location}</p>
    </div>
  );
}

export default LocationCard;
