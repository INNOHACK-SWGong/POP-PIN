import React, { useState } from 'react';
import './Slider.css';

function Slider({ data = [], onCardClick }) {
  const [currentIndex, setCurrentIndex] = useState(0);

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

  return (
    <div
      className="slider"
      style={{
        backgroundImage: `url(${currentItem.image_url})`, // 배경 이미지 추가
      }}
    >
      <button className="slider-btn prev" onClick={handlePrev}>
        &#9664;
      </button>
      <div className="slider-item" onClick={() => onCardClick(currentItem)}>
        <h2 className="slider-title">{currentItem.title}</h2>
        <p className="slider-dates">
          {currentItem.start_date} ~ {currentItem.end_date} (
          {currentItem.status})
        </p>
        <p className="slider-address">{currentItem.location}</p>
      </div>
      <button className="slider-btn next" onClick={handleNext}>
        &#9654;
      </button>
    </div>
  );
}

export default Slider;
