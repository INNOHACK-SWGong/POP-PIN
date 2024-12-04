import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import './More.css'; // CSS 파일 연결

function More() {
  const [locations, setLocations] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [filters, setFilters] = useState({
    upcoming: true,
    ongoing: true,
    ended: true,
  });

  const navigate = useNavigate();

  useEffect(() => {
    const fetchLocations = async () => {
      try {
        const response = await fetch('http://127.0.0.1:5000/festivals');
        if (!response.ok) {
          throw new Error('Failed to fetch festival data');
        }
        const data = await response.json();
        setLocations(data); // 데이터 설정
        setLoading(false); // 로딩 완료 상태 설정
      } catch (err) {
        setError(err.message); // 에러 상태 설정
        setLoading(false);
      }
    };

    fetchLocations(); // 처음 로드 시 데이터 불러오기
  }, []); // 빈 배열로 한 번만 실행되도록 설정

  // 날짜에 따른 상태를 구분하는 함수
  const getStatus = (startDate, endDate) => {
    const currentDate = new Date();
    const start = new Date(startDate);
    const end = new Date(endDate);

    if (currentDate >= start && currentDate <= end) {
      return '진행 중';
    } else if (currentDate < start) {
      const dDay = Math.ceil((start - currentDate) / (1000 * 60 * 60 * 24));
      return `D-Day`;
    } else {
      return '종료됨';
    }
  };

  // 필터링 함수
  const filteredLocations = locations.filter((location) => {
    const status = getStatus(location.start_date, location.end_date);
    const statusMatches =
      (filters.upcoming && status === 'D-Day') ||
      (filters.ongoing && status === '진행 중') ||
      (filters.ended && status === '종료됨');

    return statusMatches; // 필터 상태에 맞는 항목만 반환
  });

  // 필터 상태 변경 핸들러
  const handleFilterChange = (e) => {
    const { name, checked } = e.target;
    setFilters((prevFilters) => ({
      ...prevFilters,
      [name]: checked,
    }));
  };

  // 카드 클릭 시 상세 페이지로 이동
  const handleCardClick = (id) => {
    navigate(`/detail/${id}`);
  };

  if (loading) {
    return <div className="loading-spinner">Loading...</div>;
  }

  if (error) {
    return <div className="error-message">{error}</div>;
  }

  return (
    <div className="more-container">
      <div className="filter-container">
        <label>
          <input
            type="checkbox"
            name="upcoming"
            checked={filters.upcoming}
            onChange={handleFilterChange}
          />
          시작 예정
        </label>
        <label>
          <input
            type="checkbox"
            name="ongoing"
            checked={filters.ongoing}
            onChange={handleFilterChange}
          />
          진행 중
        </label>
        <label>
          <input
            type="checkbox"
            name="ended"
            checked={filters.ended}
            onChange={handleFilterChange}
          />
          종료된 축제
        </label>
      </div>

      {filteredLocations.length === 0 ? (
        <div className="no-festivals-message">No festivals found</div>
      ) : (
        <div className="locations-list">
          {filteredLocations.map((location) => (
            <div
              className="location-card"
              key={location.id}
              onClick={() => handleCardClick(location.id)}
            >
              <img
                className="location-image"
                src={location.image_url}
                alt={location.title}
              />
              <div className="location-details">
                <div className="location-title">{location.title}</div>
                <div className="location-location">{location.location}</div>
                <div className="location-date">
                  {new Date(location.start_date).toLocaleDateString()} -{' '}
                  {new Date(location.end_date).toLocaleDateString()}
                </div>
                <div className="location-status">
                  {getStatus(location.start_date, location.end_date)}
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

export default More;
