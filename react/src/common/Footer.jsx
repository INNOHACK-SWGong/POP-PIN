// common/Footer.js
import React from 'react';
import './Footer.css';

function Footer() {
  return (
    <footer className="app-footer">
      <div className="footer-content">
        <p>© 2024 팝Pin - 모두의 축제를 탐험하다</p>
        <p>
          <a href="/terms" className="footer-link">
            이용약관
          </a>{' '}
          |{' '}
          <a href="/privacy" className="footer-link">
            개인정보처리방침
          </a>{' '}
          |{' '}
          <a href="/contact" className="footer-link">
            문의하기
          </a>
        </p>
      </div>
    </footer>
  );
}

export default Footer;
