import React from 'react';
import './Header.css';

function Header() {
  return (
    <header className="header">
      <div className="header-logo">
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
