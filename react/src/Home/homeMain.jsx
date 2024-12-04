import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import './HomeMain.css';
import Slider from './Slider';
import LocationCard from './LocationCard';
import CalendarView from './CalendarView';

function HomeMain() {
  const [locations, setLocations] = useState([]);
  const [error, setError] = useState(null);
  const [userLocation, setUserLocation] = useState(null);
  const navigate = useNavigate();

  const SERVER_IP = process.env.REACT_APP_SERVER_IP;

  useEffect(() => {
    // Fetch festival data
    const fetchFestivals = async () => {
      try {
        const response = await fetch(`http://127.0.0.1:5000/festivals`);
        if (!response.ok) {
          throw new Error('Failed to fetch festival data');
        }
        const data = await response.json();

        const enrichedLocations = data.map((location, index) => {
          const startDate = new Date(location.start_date);
          const endDate = new Date(location.end_date);
          const currentDate = new Date();

          // 상태 추가 (진행 중 / D-Day 계산)
          let status = '';
          if (currentDate >= startDate && currentDate <= endDate) {
            status = '진행 중';
          } else if (currentDate < startDate) {
            const dDay = Math.ceil(
              (startDate - currentDate) / (1000 * 60 * 60 * 24)
            );
            status = `D-${dDay}`;
          } else {
            status = '종료됨';
          }

          return { ...location, id: index, status };
        });

        setLocations(enrichedLocations);
      } catch (err) {
        console.error(err);
        setError('Failed to fetch festival data.');
      }
    };

    fetchFestivals();

    // Fetch user location
    if (navigator.geolocation) {
      navigator.geolocation.getCurrentPosition(
        (position) => {
          setUserLocation({
            latitude: position.coords.latitude,
            longitude: position.coords.longitude,
          });
        },
        () => {
          setError('현재 위치를 가져올 수 없습니다.');
        }
      );
    } else {
      setError('Geolocation을 지원하지 않는 브라우저입니다.');
    }
  }, []);

  const handleCardClick = (location) => {
    navigate(`/detail/${location.id}`, { state: location });
  };

  // 하버사인 공식 함수
  const calculateDistance = (lat1, lon1, lat2, lon2) => {
    const R = 6371; // 지구 반지름 (km)
    const dLat = ((lat2 - lat1) * Math.PI) / 180;
    const dLon = ((lon2 - lon1) * Math.PI) / 180;
    const a =
      Math.sin(dLat / 2) * Math.sin(dLat / 2) +
      Math.cos((lat1 * Math.PI) / 180) *
        Math.cos((lat2 * Math.PI) / 180) *
        Math.sin(dLon / 2) *
        Math.sin(dLon / 2);
    const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
    return R * c; // 거리 반환 (km)
  };

  const filterNearbyFestivals = () => {
    if (!userLocation) return [];
    return locations.filter((location) => {
      const { latitude, longitude } = location;
      if (!latitude || !longitude) return false; // 위치 정보가 없으면 제외
      const distance = calculateDistance(
        userLocation.latitude,
        userLocation.longitude,
        latitude,
        longitude
      );
      return distance <= 5; // 5km 이내만 포함
    });
  };

  const filterEndingSoonFestivals = () => {
    const currentDate = new Date();
    return locations.filter((location) => {
      const endDate = new Date(location.end_date);
      const differenceInDays = Math.ceil(
        (endDate - currentDate) / (1000 * 60 * 60 * 24)
      );
      return differenceInDays > 0 && differenceInDays <= 5;
    });
  };

  return (
    <div>
      <Slider data={locations} onCardClick={handleCardClick} />
      <CalendarView events={locations} />

      <div className="section-header">
        <span className="section-icon">📍</span> 내 주변 축제에요!{' '}
        <span className="section-highlight">(5km 이내)</span>
      </div>
      <div className="scrollable-card-container">
        {filterNearbyFestivals().map((location) => (
          <LocationCard
            key={location.id}
            location={location}
            onClick={() => handleCardClick(location)}
          />
        ))}
      </div>

      <div className="section-header">
        <span className="section-icon">⏳</span> 곧 종료돼요!{' '}
        <span className="section-highlight">(5일 이내 종료)</span>
      </div>
      <div className="scrollable-card-container">
        {filterEndingSoonFestivals().map((location) => (
          <LocationCard
            key={location.id}
            location={location}
            onClick={() => handleCardClick(location)}
          />
        ))}
      </div>

      <div className="section-header">
        <span className="section-icon">🎉</span> 모든 축제를 확인하세요!
      </div>
      <div className="scrollable-card-container">
        {locations.map((location) => (
          <LocationCard
            key={location.id}
            location={location}
            onClick={() => handleCardClick(location)}
          />
        ))}
      </div>

      {error && <p className="error">{error}</p>}
    </div>
  );
}

export default HomeMain;
