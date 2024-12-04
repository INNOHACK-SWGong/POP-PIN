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
          setStatusMessage('체크 완료! 이 축제를 방문하셨습니다!');
        } else {
          setStatusMessage(
            `현재 위치와 축제 장소까지 ${distance.toFixed(
              2
            )} km입니다. 체크인 실패.`
          );
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

  const openMap = (type) => {
    if (!navigator.geolocation) {
      setStatusMessage('Geolocation을 지원하지 않는 브라우저입니다.');
      return;
    }

    navigator.geolocation.getCurrentPosition(
      (position) => {
        const { latitude: userLat, longitude: userLon } = position.coords;
        const destLat = parseFloat(data['위도']);
        const destLon = parseFloat(data['경도']);

        let url = '';
        switch (type) {
          case 'naver':
            url = `https://map.naver.com/v5/directions/-/${userLat},${userLon}/place/${destLat},${destLon}`;
            break;
          case 'google':
            url = `https://www.google.com/maps/dir/${userLat},${userLon}/${destLat},${destLon}`;
            break;
          case 'kakao':
            url = `https://map.kakao.com/link/map/route/${userLat},${userLon}/${destLat},${destLon}`;
            break;
          default:
            console.error('지원되지 않는 맵 타입입니다.');
        }

        if (url) {
          window.open(url, '_blank');
        }
      },
      () => {
        setStatusMessage('현재 위치를 가져올 수 없습니다.');
      }
    );
  };

  if (!data) {
    return <p>잘못된 접근입니다. 다시 시도해주세요.</p>;
  }

  return (
    <div className="detail-container">
      <h1>{data['축제명']}</h1>
      <p>
        <strong>개최 장소:</strong> {data['개최장소']}
      </p>
      <p>
        <strong>축제 기간:</strong> {data['축제시작일자']} ~{' '}
        {data['축제종료일자']}
      </p>
      <p>
        <strong>축제 내용:</strong> {data['축제내용']}
      </p>
      <p>
        <strong>주소:</strong>{' '}
        {data['소재지도로명주소'] || data['소재지지번주소']}
      </p>
      <p>
        <strong>위도:</strong> {data['위도']}, <strong>경도:</strong>{' '}
        {data['경도']}
      </p>
      <p>
        <strong>주관:</strong> {data['주관기관명']}
      </p>
      <p>
        <strong>문의:</strong> {data['전화번호'] || '정보 없음'}
      </p>
      <button className="check-in-button" onClick={handleCheckIn}>
        이 축제에 방문했어요!
      </button>
      {statusMessage && <p className="status-message">{statusMessage}</p>}

      <div className="map-buttons">
        <h2>길 찾기</h2>
        {/* <button onClick={() => openMap('naver')}>네이버 지도</button> */}
        <button onClick={() => openMap('google')}>구글 지도</button>
        {/* <button onClick={() => openMap('kakao')}>카카오 지도</button> */}
      </div>
    </div>
  );
}

export default DetailPage;
