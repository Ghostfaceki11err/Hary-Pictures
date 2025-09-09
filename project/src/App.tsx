import React, { useState } from 'react';
import { BrowserRouter as Router, Routes, Route, useLocation } from 'react-router-dom';
import Header from './components/Header';
import Home from './components/Home';
import Portfolio from './components/Portfolio';
import About from './components/About';
import Services from './components/Services';
import Contact from './components/Contact';
import { AdminPanel } from './admin';
import AdminLanding from './admin/landing/AdminLanding';
import AdminGate from './admin/AdminGate';
import NotFound from './components/NotFound';

// Component to handle routing logic
function AppContent() {
  const [currentPage, setCurrentPage] = useState('home');
  const location = useLocation();

  React.useEffect(() => {
    const storedTheme = localStorage.getItem('theme');
    if (storedTheme === 'dark') {
      document.documentElement.classList.add('dark');
    } else {
      document.documentElement.classList.remove('dark');
    }
  }, []);

  // Update currentPage based on URL
  React.useEffect(() => {
    const path = location.pathname;
    if (path === '/') setCurrentPage('home');
    else if (path === '/portfolio') setCurrentPage('portfolio');
    else if (path === '/about') setCurrentPage('about');
    else if (path === '/services') setCurrentPage('services');
    else if (path === '/contact') setCurrentPage('contact');
    else if (path === '/admin') setCurrentPage('admin');
  }, [location]);

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-blue-900 to-slate-800 dark:from-slate-900 dark:via-blue-900 dark:to-slate-800">
      <Header currentPage={currentPage} onPageChange={setCurrentPage} />
      <main>
        <Routes>
          <Route path="/" element={<Home onPageChange={setCurrentPage} />} />
          <Route path="/portfolio" element={<Portfolio />} />
          <Route path="/about" element={<About />} />
          <Route path="/services" element={<Services onPageChange={setCurrentPage} />} />
          <Route path="/contact" element={<Contact />} />
          <Route path="/admin" element={<AdminGate />} />
          <Route path="/admin/categories" element={<AdminPanel initialSection='categories' />} />
          <Route path="/admin/media" element={<AdminPanel initialSection='media' />} />
          {/* Removed /admin/overview per design; use /admin/gallery instead */}
          <Route path="/admin/gallery" element={<AdminPanel initialSection='gallery' />} />
          <Route path="*" element={<NotFound />} />
        </Routes>
      </main>
    </div>
  );
}

function App() {
  return (
    <Router>
      <AppContent />
    </Router>
  );
}

export default App;