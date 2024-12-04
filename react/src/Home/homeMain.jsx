import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import './HomeMain.css';
import Slider from './Slider';
import LocationCard from './LocationCard';

function HomeMain() {
  const [locations, setLocations] = useState([]);
  const [error, setError] = useState(null);
  const navigate = useNavigate();

  useEffect(() => {
    navigator.geolocation.getCurrentPosition(
      async (position) => {
        const { latitude, longitude } = position.coords;

        try {
          const response = await fetch('/festival/Haeundae.json');
          const data = await response.json();

          const currentDate = new Date();
          const validLocations = data
            .filter((location) => {
              const endDate = new Date(location['축제종료일자']);
              return endDate >= currentDate; // 현재 시점 이후 종료되는 축제만 포함
            })
            .map((location, index) => {
              const startDate = new Date(location['축제시작일자']);
              const endDate = new Date(location['축제종료일자']);
              const distance = getDistanceFromLatLonInKm(
                latitude,
                longitude,
                parseFloat(location['위도']),
                parseFloat(location['경도'])
              );

              // 상태 추가 (진행 중 / D-Day 계산)
              let status = '';
              if (currentDate >= startDate && currentDate <= endDate) {
                status = '진행 중';
              } else {
                const dDay = Math.ceil(
                  (startDate - currentDate) / (1000 * 60 * 60 * 24)
                );
                status = `D-${dDay}`;
              }

              return { ...location, distance, id: index, status };
            })
            .sort(
              (a, b) =>
                new Date(a['축제종료일자']) - new Date(b['축제종료일자'])
            );

          setLocations(validLocations);
        } catch (err) {
          console.error(err);
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
    navigate(`/detail/${location.id}`, { state: location });
  };

  return (
    <div>
      <Slider data={locations} onCardClick={handleCardClick} />
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
