import React, { useState, useEffect } from 'react';
import { Link, useLocation } from 'react-router-dom';
import { Menu, X } from 'lucide-react';
import { supabase } from '../admin/supabaseClient';

interface HeaderProps {
  currentPage: string;
  onPageChange: (page: string) => void;
}

const Header: React.FC<HeaderProps> = ({ currentPage, onPageChange }) => {
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [isScrolled, setIsScrolled] = useState(false);
  const location = useLocation();
  const [signingOut, setSigningOut] = useState(false);
  const [isAuthed, setIsAuthed] = useState(false);

  const navItems = [
    { id: 'home', label: 'Home', path: '/' },
    { id: 'portfolio', label: 'Portfolio', path: '/portfolio' },
    { id: 'about', label: 'About Me', path: '/about' },
    { id: 'services', label: 'Services', path: '/services' },
    { id: 'contact', label: 'Contact', path: '/contact' }
  ];

  useEffect(() => {
    const handleScroll = () => {
      setIsScrolled(window.scrollY > 50);
    };

    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  // Track auth state to decide showing Sign Out
  useEffect(() => {
    let mounted = true;
    supabase.auth.getSession().then(({ data: { session } }) => {
      if (!mounted) return;
      setIsAuthed(!!session);
    });
    const { data: sub } = supabase.auth.onAuthStateChange((_event, session) => {
      if (!mounted) return;
      setIsAuthed(!!session);
    });
    return () => {
      mounted = false;
      sub.subscription.unsubscribe();
    };
  }, []);

  const isAdminRoute = location.pathname === '/admin';
  const hideMainNavOnAdmin = (
    location.pathname === '/admin/categories' ||
    location.pathname === '/admin/media' ||
    location.pathname === '/admin/gallery'
  );

  return (
    <header className={`fixed top-0 left-0 right-0 z-50 transition-all duration-300 ${
      isScrolled ? 'bg-slate-900/95 backdrop-blur-md shadow-lg' : 'bg-transparent'
    }`}>
      <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Sign Out button shown only on /admin AND when authenticated, top-right */}
        {isAdminRoute && isAuthed && (
          <button
            onClick={async () => {
              if (signingOut) return;
              setSigningOut(true);
              try {
                await supabase.auth.signOut();
              } catch (e) {
                console.error(e);
              } finally {
                setSigningOut(false);
              }
            }}
            disabled={signingOut}
            className="absolute right-4 md:right-6 top-1/2 -translate-y-1/2 bg-red-600 hover:bg-red-700 disabled:bg-red-800 text-white px-4 py-2 rounded-full text-sm font-semibold transition-colors duration-200 shadow-sm hover:shadow md:px-5"
            aria-label="Sign Out"
          >
            {signingOut ? 'Signing out...' : 'Sign Out'}
          </button>
        )}

        <div className="flex justify-between items-center py-4">
          {/* Logo */}
          <Link to="/" className="flex items-center cursor-pointer">
            <img 
              src="/20250423_215536.jpg" 
              alt="Photography Logo" 
              className="h-10 w-auto mr-3 rounded-lg shadow-md hover:shadow-lg transition-shadow duration-300"
              loading="lazy"
            />
            <span className="text-white font-bold text-xl tracking-wide">Hary Pictures</span>
          </Link>

          {/* Desktop Navigation (hidden on /admin and admin subroutes) */}
          {!(isAdminRoute || hideMainNavOnAdmin) && (
            <nav className="hidden md:flex space-x-8">
              {navItems.map((item) => (
                <Link
                  key={item.id}
                  to={item.path}
                  className={`text-white font-medium transition-all duration-300 hover:text-blue-400 relative group ${
                    location.pathname === item.path ? 'text-blue-400' : ''
                  }`}
                >
                  {item.label}
                  <span className={`absolute -bottom-1 left-0 w-0 h-0.5 bg-blue-400 transition-all duration-300 group-hover:w-full ${
                    location.pathname === item.path ? 'w-full' : ''
                  }`}></span>
                </Link>
              ))}
            </nav>
          )}

          {/* Mobile Menu Button (hidden on /admin and admin subroutes) */}
          {!(isAdminRoute || hideMainNavOnAdmin) && (
            <button
              className="md:hidden text-white p-2 hover:bg-white/10 rounded-lg transition-colors duration-300"
              onClick={() => setIsMenuOpen(!isMenuOpen)}
            >
              {isMenuOpen ? <X size={24} /> : <Menu size={24} />}
            </button>
          )}
        </div>

        {/* Mobile Navigation (hidden on /admin and admin subroutes) */}
        {!(isAdminRoute || hideMainNavOnAdmin) && isMenuOpen && (
          <div className="md:hidden bg-slate-900/95 backdrop-blur-md rounded-lg mt-2 mb-4 overflow-hidden">
            {navItems.map((item) => (
              <Link
                key={item.id}
                to={item.path}
                onClick={() => setIsMenuOpen(false)}
                className={`block w-full text-left px-4 py-3 text-white font-medium transition-colors duration-300 hover:bg-blue-600/20 ${
                  location.pathname === item.path ? 'bg-blue-600/30 text-blue-400' : ''
                }`}
              >
                {item.label}
              </Link>
            ))}
          </div>
        )}
      </div>
    </header>
  );
};

export default Header;