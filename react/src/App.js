import React from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import HomeMain from './home/HomeMain';
import DetailPage from './detail/DetailPage';
import Header from './common/Header';
import Footer from './common/Footer';
import Search from './search/Search';
import More from './more/More';

function App() {
  return (
    <Router>
      <Header />
      <Routes>
        <Route path="/" element={<HomeMain />} />
        <Route path="/detail/:id" element={<DetailPage />} />
        <Route path="/search" element={<Search />} />
        <Route path="/more" element={<More />} />
      </Routes>
      <Footer />
    </Router>
  );
}

export default App;
