import React, { useEffect, useState } from 'react';
import { useParams } from 'react-router-dom';
import './DetailPage.css';

function DetailPage() {
  const { id } = useParams();
  const [festival, setFestival] = useState(null);
  const [error, setError] = useState(null);
  const [loading, setLoading] = useState(false);
  const [statusMessage, setStatusMessage] = useState('');

  const today = new Date();

  // /festivals/<id> 엔드포인트에서 축제 데이터 가져오기
  useEffect(() => {
    const fetchFestival = async () => {
      setLoading(true);
      try {
        const response = await fetch(`http://127.0.0.1:5000/festivals/${id}`);
        if (!response.ok) {
          if (response.status === 404) {
            throw new Error('축제를 찾을 수 없습니다.');
          } else {
            throw new Error('축제 데이터를 가져오는 중 오류가 발생했습니다.');
          }
        }
        const data = await response.json();
        setFestival(data);
      } catch (err) {
        console.error(err);
        setError(
          err.message || '축제 데이터를 가져오는 중 오류가 발생했습니다.'
        );
      } finally {
        setLoading(false);
      }
    };

    fetchFestival();
  }, [id]);

  // festival이 있을 때만 OpenAI API 호출
  useEffect(() => {
    if (festival) {
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
            console.log('OpenAI Response:', data);
            setStatusMessage(data);
          } else {
            setStatusMessage('서버 오류가 발생했습니다. 다시 시도해 주세요.');
            console.error('OpenAI Error Response:', await response.text());
          }
        } catch (error) {
          setStatusMessage('네트워크 오류가 발생했습니다. 다시 시도해 주세요.');
          console.error('Error fetching festival data:', error);
        }
      };

      fetchFestivalData();
    }
  }, [festival]); // festival이 변경될 때마다 실행

  if (loading) {
    return <p className="loading-message">로딩 중...</p>;
  }

  if (error) {
    return <p className="error-message">{error}</p>;
  }

  if (!festival) {
    return null; // festival이 null일 경우 리턴
  }

  const startDate = new Date(festival.start_date);
  const endDate = new Date(festival.end_date);

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

  const {
    title,
    date,
    start_date,
    end_date,
    location,
    geocode_location,
    latitude,
    longitude,
    image_url,
    status,
  } = festival;

  const openGoogleMaps = () => {
    if (!latitude || !longitude) {
      alert('축제 위치 정보가 없습니다.');
      return;
    }

    const url = `https://www.google.com/maps/dir//${latitude},${longitude}`;
    window.open(url, '_blank');
  };

  const openGoogleSearch = () => {
    const url = `https://www.google.com/search?q=${encodeURIComponent(title)}`;
    window.open(url, '_blank');
  };

  const openNaverSearch = () => {
    const url = `https://search.naver.com/search.naver?query=${encodeURIComponent(
      title
    )}`;
    window.open(url, '_blank');
  };

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
          <img src={image_url} alt={title} loading="lazy" />
        </div>
        <div className="detail-info">
          <h1 className="detail-title">{title}</h1>
          <p className="detail-date">
            <strong>시작일:</strong> {start_date}
          </p>
          <p className="detail-date">
            <strong>종료일:</strong> {end_date}
          </p>
          <p className="detail-location">
            <strong>위치:</strong> {location || '정보 없음'}
          </p>
          <p className="detail-status">
            <strong>상태:</strong> {status}
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
          <img src="/openai_logo_white.png" alt="OpenAI Logo" />
        </div>
        <p>{statusMessage}</p>
      </div>

      {/* 검색 버튼 */}
      <div className="search-buttons">
        <button className="search-button-google" onClick={openGoogleSearch}>
          <img src="/google_logo.png" alt="Google Logo" />
          Google에서 검색
        </button>
        <button className="search-button-naver" onClick={openNaverSearch}>
          <img src="/naver_logo.png" alt="Naver Logo" />
          Naver에서 검색
        </button>
      </div>
    </div>
  );
}

export default DetailPage;
