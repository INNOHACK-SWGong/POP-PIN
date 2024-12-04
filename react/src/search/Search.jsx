// src/pages/Search/Search.jsx
import React, { useState, useEffect } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import axios from 'axios';
import FestivalCard from '../components/festivalCard/FestivalCard';
import './Search.css';

function Search() {
  const location = useLocation();
  const navigate = useNavigate();
  const params = new URLSearchParams(location.search);
  const query = params.get('query');

  const [festivals, setFestivals] = useState([]);
  const [locations, setLocations] = useState([]);
  const [filteredLocations, setFilteredLocations] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  useEffect(() => {
    // Fetch festival data
    const fetchFestivals = async () => {
      try {
        const response = await fetch(`http://127.0.0.1:5000/festivals`);
        if (!response.ok) {
          throw new Error('Failed to fetch festival data');
        }
        const data = await response.json();

        const enrichedLocations = data.map((location) => {
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

          return { ...location, status }; // id: index 제거
        });

        setLocations(enrichedLocations);
      } catch (err) {
        console.error(err);
        setError('Failed to fetch festival data.');
      }
    };

    fetchFestivals();
  }, []);

  useEffect(() => {
    if (!query) return;

    const fetchFestivals = async () => {
      setLoading(true);
      setError(null);
      setFestivals([]);

      try {
        const response = await axios.post('http://127.0.0.1:5000/search', {
          query: query,
        });

        const data = response.data;
        console.log('data:', data);

        // 현재 날짜
        const currentDate = new Date();

        const enrichedFestivals = data.map((festival) => {
          const startDate = new Date(festival.start_date);
          const endDate = new Date(festival.end_date);
          const currentDate = new Date();

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

          return { ...festival, status }; // 서버에서 받은 id를 그대로 사용
        });

        setFestivals(enrichedFestivals);
      } catch (err) {
        console.error(err);
        setError(err.response?.data?.message || '검색 중 오류가 발생했습니다.');
      } finally {
        setLoading(false);
      }
    };

    fetchFestivals();
  }, [query]);

  useEffect(() => {
    const filterLocations = locations.filter((filterLocation) =>
      filterLocation.title.includes(query)
    );
    setFilteredLocations(filterLocations);
    console.log('filterLocations:', filterLocations);
    console.log('filteredLocations:', filteredLocations);
  }, [query]);

  return (
    <div className="search-page">
      <h1>검색 결과</h1>
      <div className="festivals-container">
        {filteredLocations &&
          filteredLocations.map((filteredLocation) => (
            <FestivalCard
              key={filteredLocation.id}
              festival={filteredLocation}
              navigate={navigate}
            />
          ))}
      </div>
      {query ? (
        <p>"{query}"에 대한 검색 결과를 아래에서 확인하세요.</p>
      ) : (
        <p>검색어를 입력해 주세요.</p>
      )}

      {loading && <p className="loading-message">검색 중...</p>}
      {error && <p className="error-message">{error}</p>}

      <div className="festivals-container">
        {festivals && festivals.length > 0
          ? festivals.map((festival) => (
              <FestivalCard
                key={festival.id}
                festival={festival}
                navigate={navigate}
              />
            ))
          : !loading && query && <p>검색 결과가 없습니다.</p>}
      </div>
    </div>
  );
}

export default Search;
