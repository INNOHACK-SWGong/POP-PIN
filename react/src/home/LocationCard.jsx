import React from 'react';
import './LocationCard.css';

function LocationCard({ location, onClick, isEndingSoon }) {
  const today = new Date();

  const getStatus = () => {
    const startDate = new Date(location.start_date);
    const endDate = new Date(location.end_date);
    
    // "filterEndingSoonFestivals"일 때 다른 로직 적용
    if (isEndingSoon) {
      if (today >= startDate && today <= endDate) {
        const differenceInDays = Math.ceil(
          (endDate - today) / (1000 * 60 * 60 * 24)
        );
        return { status: '진행중', alternativeStatus: `종료 D-${differenceInDays - 1}` };
      } else if (today > endDate) {
        return { status: '종료됨', alternativeStatus: null };
      } else {
        const differenceInDays = Math.ceil(
          (startDate - today) / (1000 * 60 * 60 * 24)
        );
        const differenceInDays1 = Math.ceil(
          (endDate - today) / (1000 * 60 * 60 * 24)
        );
        return { status: `시작 D-${differenceInDays - 1}`, alternativeStatus: `종료 D-${differenceInDays1 - 1}` };;
      }
    } else {
      // 기본 로직
      if (today > endDate) {
        return { status: '종료됨', alternativeStatus: null };
      } else if (today >= startDate) {
        const differenceInDays1 = Math.ceil(
          (endDate - today) / (1000 * 60 * 60 * 24)
        );
        return { status: '진행 중',  alternativeStatus: `종료 D-${differenceInDays1 - 1}` };
      } else {
        const differenceInDays = Math.ceil(
          (startDate - today) / (1000 * 60 * 60 * 24)
        );
        const differenceInDays1 = Math.ceil(
          (endDate - today) / (1000 * 60 * 60 * 24)
        );
        return { status: `시작 D-${differenceInDays - 1}`,  alternativeStatus: `종료 D-${differenceInDays1 - 1}` };
      }
    }
  };
  const { status, alternativeStatus } = getStatus();

  return (
    <div className="location-card" onClick={onClick}>
      <div className="card-image">
        <img src={location.image_url} alt={location.title} />
      </div>
      <div className="card-content">
        <h2 className="card-title">{location.title}</h2>
        <p className="card-dates">
          {location.start_date} ~ {location.end_date}
        </p>
        <p className={`card-status ${status.replace(' ', '').toLowerCase()}`}>
          {status}
        </p>
        <p className={"card-status"}>
          {alternativeStatus}
        </p>
        <p className="card-address">{location.location || '위치 정보 없음'}</p>
      </div>
    </div>
  );
}

export default LocationCard;
