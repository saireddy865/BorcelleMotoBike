import React from 'react';
import { Link } from 'react-router-dom';
import '../styles/landing.css';
import bannerImage from '../../../public/bike banner.png';

function Landing() {
  return (
    <section className="banner">
      <div className="banner-content">
        <h1 className="banner-caption">
          Drive Your Dream <span>Rent... Drive... Enjoy...</span>
        </h1>
        <Link to="/cars" className="banner-cta">
          Browse Bikes
        </Link>
      </div>
    </section>
  );
}

export default Landing;