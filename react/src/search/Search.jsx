// src/pages/Search/Search.jsx
import React from 'react';
import { useLocation } from 'react-router-dom';
import './Search.css';

function Search() {
  const location = useLocation();
  const params = new URLSearchParams(location.search);
  const query = params.get('query');

  return (
    <div className="search-page">
      <h1>검색 결과</h1>
      {query ? (
        <p>"{query}"에 대한 검색 결과를 여기에 표시합니다.</p>
      ) : (
        <p>검색어를 입력해 주세요.</p>
      )}
      {/* 실제 검색 결과를 여기에 추가할 수 있습니다. */}
    </div>
  );
}

export default Search;
