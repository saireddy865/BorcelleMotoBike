import React, { useState } from 'react';
import './Header.css';
import { Link } from 'react-router-dom';

function Header() {
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');

  const toggleMenu = () => {
    setIsMenuOpen(!isMenuOpen);
  };

  const handleSearch = (e) => {
    e.preventDefault();
    // Implement your search functionality here
    console.log('Searching for:', searchQuery);
    // You can navigate to search results or filter content
  };

  return (
    <header className="header">
      <div className="logo-container">
        <img src="../public/bike logo dark.png" alt="Borcelle Motobike Logo" />
        <h3>Borcelle Motobike</h3>
      </div>

      {/* Centered Search - Visible on desktop */}
      {/* <form className="search-container desktop-search" onSubmit={handleSearch}>
        <input 
          type="text" 
          placeholder="Search Bikes..." 
          className="search-input" 
          aria-label="Search bikes"
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
        />
        <button type="submit" className="search-button">Search</button>
      </form> */}

      <button 
        className="hamburger" 
        onClick={toggleMenu}
        aria-label={isMenuOpen ? 'Close menu' : 'Open menu'}
      >
        {isMenuOpen ? '✕' : '☰'}
      </button>

      <div className={`nav-container ${isMenuOpen ? 'open' : ''}`}>
        <nav>
          <ul className="nav-links">
            <li><Link to="/home" onClick={() => setIsMenuOpen(false)}>Home</Link></li>
            <li><Link to="/about" onClick={() => setIsMenuOpen(false)}>About</Link></li>
            <li><Link to="/services" onClick={() => setIsMenuOpen(false)}>Services</Link></li>
            <li><Link to="/login" onClick={() => setIsMenuOpen(false)}>Log/Reg</Link></li>
          </ul>
          
          
        </nav>
      </div>
    </header>
  );
}

export default Header;