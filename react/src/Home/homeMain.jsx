import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import './HomeMain.css';
import Slider from './Slider';
import LocationCard from './LocationCard';
import CalendarView from './CalendarView';

function HomeMain() {
  const [locations, setLocations] = useState([]);
  const [error, setError] = useState(null);
  const navigate = useNavigate();

  const SERVER_IP = process.env.REACT_APP_SERVER_IP;

  useEffect(() => {
    const fetchFestivals = async () => {
      try {
        const response = await fetch(`http://127.0.0.1:5000/festivals`);
        if (!response.ok) {
          throw new Error('Failed to fetch festival data');
        }
        const data = await response.json();
        console.log(`data:`, data);

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
  }, []);

  const handleCardClick = (location) => {
    navigate(`/detail/${location.id}`, { state: location });
  };

  return (
    <div>
      <Slider data={locations} onCardClick={handleCardClick} />
      <CalendarView events={locations} />
      <h2>모든 축제를 확인하세요!</h2>
      <div className="card-container">
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
