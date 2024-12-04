import React, { useState, useEffect } from 'react';
import { useLocation } from 'react-router-dom';
import './DetailPage.css';

function DetailPage() {
  const location = useLocation();
  const festival = location.state;

  const today = new Date();
  const startDate = new Date(festival.start_date);
  const endDate = new Date(festival.end_date);

  const SERVER_IP = process.env.REACT_APP_SERVER_IP;

  const [statusMessage, setStatusMessage] = useState(''); // 로딩 상태
  // console.log('festival.location:', festival.original_location);
  // console.log('festival:', festival);

  useEffect(() => {
    // 서버로 데이터를 전송하는 예시
    const fetchFestivalData = async () => {
      setStatusMessage('데이터를 불러오는 중...');

      try {
        const response = await fetch(`http://127.0.0.1:5000/openai`, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            festival: festival,
          }),
        });

        if (response.ok) {
          const data = await response.json();
          console.log(data);
          setStatusMessage(data);
        } else {
          setStatusMessage('서버 오류가 발생했습니다. 다시 시도해 주세요.');
        }
      } catch (error) {
        setStatusMessage('네트워크 오류가 발생했습니다. 다시 시도해 주세요.');
        console.error('Error fetching festival data:', error);
      }
    };

    fetchFestivalData();
  }, [festival]); // festival이 변경될 때마다 서버 요청을 보냄

  // Generate ±5 days around today
  const generateCalendarDates = () => {
    const dates = [];
    for (let i = -5; i <= 5; i++) {
      const date = new Date();
      date.setDate(today.getDate() + i);
      dates.push(date);
    }
    return dates;
  };

  const isFestivalActive = (date) => {
    // Remove time from dates for accurate comparison
    const strippedDate = new Date(
      date.getFullYear(),
      date.getMonth(),
      date.getDate()
    );
    const strippedStartDate = new Date(
      startDate.getFullYear(),
      startDate.getMonth(),
      startDate.getDate()
    );
    const strippedEndDate = new Date(
      endDate.getFullYear(),
      endDate.getMonth(),
      endDate.getDate()
    );

    return strippedDate >= strippedStartDate && strippedDate <= strippedEndDate;
  };

  const openGoogleSearch = () => {
    const url = `https://www.google.com/search?q=${encodeURIComponent(
      festival.title
    )}`;
    window.open(url, '_blank');
  };

  const openNaverSearch = () => {
    const url = `https://search.naver.com/search.naver?query=${encodeURIComponent(
      festival.title
    )}`;
    window.open(url, '_blank');
  };

  const openGoogleMaps = () => {
    if (!festival.latitude || !festival.longitude) {
      alert('축제 위치 정보가 없습니다.');
      return;
    }

    const { latitude, longitude } = festival;
    const url = `https://www.google.com/maps/dir//${latitude},${longitude}`;
    window.open(url, '_blank');
  };

  if (!festival) {
    return <p>잘못된 접근입니다. 다시 시도해주세요.</p>;
  }

  return (
    <div className="detail-page">
      {/* 한 줄 달력 */}
      <div className="calendar-strip">
        {generateCalendarDates().map((date, index) => {
          const isToday = date.toDateString() === today.toDateString();
          const active = isFestivalActive(date);
          return (
            <div
              key={index}
              className={`calendar-date ${isToday ? 'today' : ''} ${
                active ? 'active' : ''
              }`}
            >
              {isToday ? '오늘' : `${date.getMonth() + 1}/${date.getDate()}`}
            </div>
          );
        })}
      </div>

      {/* 상세 정보 */}
      <div className="detail-container">
        <div className="detail-image">
          <img src={festival.image_url} alt={festival.title} />
        </div>
        <div className="detail-info">
          <h1 className="detail-title">{festival.title}</h1>
          <p>
            <strong>시작일:</strong> {festival.start_date}
          </p>
          <p>
            <strong>종료일:</strong> {festival.end_date}
          </p>
          <p>
            <strong>위치:</strong> {festival.location || '정보 없음'}
          </p>
          <div className="map-section">
            <p>
              <strong>길 찾기</strong>
            </p>
            <button className="map-button" onClick={openGoogleMaps}>
              <img src="/google_map.png" alt="Google Maps" /> Google Maps로 이동
            </button>
          </div>
        </div>
      </div>

      {/* 설명 */}
      <div className="status-message">
        <div className="status-ai-logo">
          <img src="/openai_logo_white.png"></img>
        </div>
        <p>{statusMessage}</p>
      </div>

      {/* 검색 버튼 */}
      <div className="search-buttons">
        <button className="search-button-google" onClick={openGoogleSearch}>
          Google에서 검색
        </button>
        <button className="search-button-naver" onClick={openNaverSearch}>
          Naver에서 검색
        </button>
      </div>
    </div>
  );
}

export default DetailPage;
