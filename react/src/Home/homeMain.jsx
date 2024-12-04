import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom'; // useNavigate 사용
import './HomeMain.css';
import LocationCard from './LocationCard';

function HomeMain() {
  const [locations, setLocations] = useState([]);
  const [error, setError] = useState(null);
  const navigate = useNavigate(); // 네비게이션 함수

  useEffect(() => {
    navigator.geolocation.getCurrentPosition(
      async (position) => {
        const { latitude, longitude } = position.coords;

        try {
          const response = await fetch('/land_data.json');
          const data = await response.json();

          const nearbyLocations = data.records
            .map((location, index) => {
              const distance = getDistanceFromLatLonInKm(
                latitude,
                longitude,
                parseFloat(location['위도']),
                parseFloat(location['경도'])
              );
              return { ...location, distance, id: index }; // 고유 ID 추가
            })
            .filter((location) => location.distance <= 20)
            .sort((a, b) => a.distance - b.distance);

          setLocations(nearbyLocations.slice(0, 10));
        } catch (err) {
          setError('Failed to fetch location data.');
        }
      },
      (err) => {
        setError('Failed to get your current location.');
      }
    );
  }, []);

  function getDistanceFromLatLonInKm(lat1, lon1, lat2, lon2) {
    const R = 6371;
    const dLat = deg2rad(lat2 - lat1);
    const dLon = deg2rad(lon2 - lon1);
    const a =
      Math.sin(dLat / 2) * Math.sin(dLat / 2) +
      Math.cos(deg2rad(lat1)) *
        Math.cos(deg2rad(lat2)) *
        Math.sin(dLon / 2) *
        Math.sin(dLon / 2);
    const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
    return R * c;
  }

  function deg2rad(deg) {
    return deg * (Math.PI / 180);
  }

  const handleCardClick = (location) => {
    navigate(`/detail/${location.id}`, { state: location }); // 상세 정보 전달
  };

  return (
    <div>
      <h1>요 길 어때요?</h1>
      {error && <p className="error">{error}</p>}
      <div className="card-container">
        {locations.map((location) => (
          <LocationCard
            key={location.id}
            location={location}
            onClick={() => handleCardClick(location)}
          />
        ))}
      </div>
    </div>
  );
}

export default HomeMain;
