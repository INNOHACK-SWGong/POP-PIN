import React from 'react';
import { useNavigate } from 'react-router-dom'; // useNavigate 사용
import './Header.css';

function Header() {
  const navigate = useNavigate(); // 네비게이션 함수

  const handleLogoClick = () => {
    navigate('/'); // '/' 경로로 이동
  };

  return (
    <header className="header">
      <div className="header-logo" onClick={handleLogoClick}>
        <img src="/PopPinLogoWhite.png" alt="PopPinLogo" />
      </div>
      <div className="header-actions">
        <button className="header-btn">검색</button>
        <button className="header-btn">맵</button>
        <button className="header-btn">캘린더</button>
      </div>
    </header>
  );
}

export default Header;
