import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import './Slider.css';

function Slider({ data = [], onCardClick }) {
  const [currentIndex, setCurrentIndex] = useState(0);
  const navigate = useNavigate();

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

  const handleDetailsClick = () => {
    if (data[currentIndex]) {
      navigate(`/detail/${data[currentIndex].id}`);
    }
  };

  useEffect(() => {
    if (data.length === 0) return;

    const interval = setInterval(() => {
      handleNext();
    }, 5000);

    return () => clearInterval(interval); // Cleanup on unmount
  }, [data, currentIndex]); // Dependencies: data and currentIndex

  if (data.length === 0) {
    return <div className="slider-empty">데이터가 없습니다.</div>;
  }

  const currentItem = data[currentIndex];

  return (
    <div className="slider">
      <div
        className="slider-background"
        style={{
          backgroundImage: `url(${currentItem.image_url})`,
        }}
      ></div>

      <div className="slider-content">
        <div className="slider-item">
          <h2 className="slider-title">{currentItem.title}</h2>
          <p className="slider-dates">
            {currentItem.start_date} ~ {currentItem.end_date} (
            {currentItem.status})
          </p>
          <p className="slider-address">{currentItem.location}</p>
          <button className="details-button" onClick={handleDetailsClick}>
            자세히 보기
          </button>
        </div>
        <div className="slider-image">
          <img src={currentItem.image_url} alt={currentItem.title} />
        </div>
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
