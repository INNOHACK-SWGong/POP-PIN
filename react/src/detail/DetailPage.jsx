import React, { useState } from 'react';
import { useLocation } from 'react-router-dom';
import './DetailPage.css';

function DetailPage() {
  const location = useLocation();
  const data = location.state; // HomeMain에서 전달된 데이터
  const [statusMessage, setStatusMessage] = useState(null);

  const handleCheckIn = () => {
    if (!navigator.geolocation) {
      setStatusMessage('Geolocation을 지원하지 않는 브라우저입니다.');
      return;
    }

    // 현재 위치 가져오기
    navigator.geolocation.getCurrentPosition(
      (position) => {
        const { latitude: userLat, longitude: userLon } = position.coords;
        const targetLat = parseFloat(data['위도']);
        const targetLon = parseFloat(data['경도']);

        const distance = getDistanceFromLatLonInKm(
          userLat,
          userLon,
          targetLat,
          targetLon
        );

        if (distance <= 0.5) {
          setStatusMessage('체크 완료!');
        } else {
          setStatusMessage('체크가 불가능합니다.');
        }
      },
      () => {
        setStatusMessage('현재 위치를 가져올 수 없습니다.');
      }
    );
  };

  // 하버사인 공식
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

  if (!data) {
    return <p>잘못된 접근입니다. 다시 시도해주세요.</p>;
  }

  return (
    <div className="detail-container">
      <h1>{data['관광지명']}</h1>
      <p>
        <strong>주소:</strong>{' '}
        {data['소재지도로명주소'] || data['소재지지번주소']}
      </p>
      <p>
        <strong>소개:</strong> {data['관광지소개']}
      </p>
      <p>
        <strong>거리 계산에 사용될 위도:</strong> {data['위도']}
      </p>
      <p>
        <strong>거리 계산에 사용될 경도:</strong> {data['경도']}
      </p>
      <button className="check-in-button" onClick={handleCheckIn}>
        이 곳에 방문했어요!
      </button>
      {statusMessage && <p className="status-message">{statusMessage}</p>}
    </div>
  );
}

export default DetailPage;
