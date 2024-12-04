import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import './HomeMain.css';
import Slider from './Slider';
import LocationCard from './LocationCard';
import CalendarView from './CalendarView';

function HomeMain() {
  const [locations, setLocations] = useState([]);
  const [filteredLocations, setFilteredLocations] = useState([]);
  const [selectedRegion, setSelectedRegion] = useState('부산광역시');
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
          setFilteredLocations(
            validLocations.filter((loc) =>
              loc['소재지도로명주소']?.includes(selectedRegion)
            )
          );
        } catch (err) {
          console.error(err);
          setError('Failed to fetch location data.');
        }
      },
      (err) => {
        setError('Failed to get your current location.');
      }
    );
  }, [selectedRegion]);

  const handleRegionChange = (event) => {
    setSelectedRegion(event.target.value);
    const filtered = locations.filter((loc) =>
      loc['소재지도로명주소']?.includes(event.target.value)
    );
    setFilteredLocations(filtered);
  };

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
      <Slider data={filteredLocations} onCardClick={handleCardClick} />
      <CalendarView events={locations} />
      <div className="region-selector">
        <label htmlFor="region">지역 선택:</label>
        <select
          id="region"
          value={selectedRegion}
          onChange={handleRegionChange}
        >
          <option value="부산광역시">부산광역시</option>
          <option value="서울특별시">서울특별시</option>
          <option value="대구광역시">대구광역시</option>
          <option value="인천광역시">인천광역시</option>
          <option value="광주광역시">광주광역시</option>
          <option value="대전광역시">대전광역시</option>
          <option value="울산광역시">울산광역시</option>
        </select>
      </div>
      <h2>{selectedRegion} 근처 축제를 확인하세요!</h2>
      <div className="card-container">
        {filteredLocations.map((location) => (
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
