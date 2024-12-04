// src/components/Header/Header.jsx
import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faSearch } from '@fortawesome/free-solid-svg-icons';
import './Header.css';

function Header() {
  const navigate = useNavigate();
  const [searchQuery, setSearchQuery] = useState('');

  const handleLogoClick = () => {
    navigate('/');
  };

  const handleSearchSubmit = (e) => {
    e.preventDefault();
    if (searchQuery.trim()) {
      navigate(`/search?query=${encodeURIComponent(searchQuery.trim())}`);
      setSearchQuery('');
    }
  };

  const handleMoreClick = () => {
    navigate('/more');
  };

  const handleCalendarClick = () => {
    navigate('/calendar');
  };

  return (
    <header className="header">
      <div className="header-logo" onClick={handleLogoClick}>
        <img src="/PopPinLogoWhite.png" alt="PopPinLogo" />
      </div>
      <form className="header-search" onSubmit={handleSearchSubmit}>
        <input
          type="text"
          placeholder="검색"
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
        />
        <button type="submit" className="search-icon">
          <FontAwesomeIcon icon={faSearch} />
        </button>
      </form>
      <div className="header-actions">
        <button className="header-btn" onClick={handleMoreClick}>
          모두 보기
        </button>
        {/*
        <button className="header-btn" onClick={handleCalendarClick}>
          캘린더
        </button> */}
      </div>
    </header>
  );
}

export default Header;
