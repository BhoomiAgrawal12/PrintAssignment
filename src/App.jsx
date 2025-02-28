import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import Preview from './Preview';
import Home from './Home';
import './App.css';
export default function App() {
  return (
    <Router>
      <Routes>
        <Route path="/" element={<Home />} />
        <Route path="/preview" element={<Preview />} />
      </Routes>
    </Router>
    
  );
}