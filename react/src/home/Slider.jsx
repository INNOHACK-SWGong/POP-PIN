import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import './Slider.css';

function Slider({ data = [], onCardClick }) {
  const [currentIndex, setCurrentIndex] = useState(0);
  const navigate = useNavigate();

  if (!data || data.length === 0) {
    return <div className="slider-empty">데이터가 없습니다.</div>;
  }

  const handleNext = () => {
    setCurrentIndex((prevIndex) =>
      prevIndex === data.length - 1 ? 0 : prevIndex + 1
    );
  };

  const handlePrev = () => {
    setCurrentIndex((prevIndex) =>
      prevIndex === 0 ? data.length - 1 : prevIndex - 1
    );
  };

  const currentItem = data[currentIndex];

  const handleDetailsClick = () => {
    navigate(`/detail/${currentItem.id}`, { state: currentItem });
  };

  return (
    <div className="slider">
      {/* 배경 이미지 전용 div */}
      <div
        className="slider-background"
        style={{
          backgroundImage: `url(${currentItem.image_url})`,
        }}
      ></div>

      {/* 콘텐츠 */}
      <div className="slider-content">
        <div className="slider-item">
          <h2 className="slider-title">{currentItem.title}</h2>
          <p className="slider-dates">
            {currentItem.start_date} ~ {currentItem.end_date} (
            {currentItem.status})
          </p>
          <p className="slider-address">{currentItem.location}</p>
        </div>
        <div className="slider-image">
          <img src={currentItem.image_url} alt={currentItem.title} />
        </div>
        <button className="details-button" onClick={handleDetailsClick}>
          자세히 보기
        </button>
      </div>
      <button className="slider-btn prev" onClick={handlePrev}>
        &#9664;
      </button>
      <button className="slider-btn next" onClick={handleNext}>
        &#9654;
      </button>
    </div>
  );
}

export default Slider;
