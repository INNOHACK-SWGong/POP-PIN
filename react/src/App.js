import { BrowserRouter as Router, Routes, Route, Link } from 'react-router-dom'; // React Router 가져오기
import Home from './Home/homeMain'; // Home 컴포넌트 가져오기

function App() {
  return (
    <Router>
      <Routes>
        <Route path="/" element={<Home />} /> {/* Home 경로 설정 */}
      </Routes>
    </Router>
  );
}

export default App;
