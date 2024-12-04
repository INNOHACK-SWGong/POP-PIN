import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import './HomeMain.css';
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
          // festival/Haeundae 경로에서 데이터 가져오기
          const response = await fetch('/festival/Haeundae.json');
          const data = await response.json();

          const currentDate = new Date();

          // 축제 필터링 및 정렬
          const validLocations = data
            .filter((location) => {
              const endDate = new Date(location['축제종료일자']);
              return endDate > currentDate; // 오늘 이후에 종료되는 축제만 필터링
            })
            .map((location, index) => {
              const distance = getDistanceFromLatLonInKm(
                latitude,
                longitude,
                parseFloat(location['위도']),
                parseFloat(location['경도'])
              );
              return { ...location, distance, id: index };
            })
            .sort(
              (a, b) =>
                new Date(a['축제종료일자']) - new Date(b['축제종료일자'])
            ); // 종료일 기준 정렬

          setLocations(validLocations.slice(0, 10)); // 상위 10개 축제만 표시
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
    const R = 6371; // 지구 반지름 (km)
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
