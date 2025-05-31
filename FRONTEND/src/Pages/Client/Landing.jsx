import React from 'react';
import { Link } from 'react-router-dom';
import { Button, Typography, Box } from '@mui/material';
import bannerImage from '../../../public/bike banner.png';
import BikeCategoriesFilter from './BikeCategories.jsx';
import '../styles/landing.css';

function Landing() {
  return (
    <div className="landing-container">
      {/* Hero Banner Section */}
      <section className="banner" style={{ backgroundImage: `url(${bannerImage})` }}>
        <div className="banner-overlay"></div>
        <div className="banner-content">
          <Typography variant="h1" className="banner-title">
            Rent...Drive... <span className="highlight">Borcelle MotoBike</span>
          </Typography>
          {/* <Typography variant="subtitle1" className="banner-subtitle">
            Rent. Ride. Enjoy. Premium bikes at your fingertips.
          </Typography> */}
          <div className="cta-container">
            <Button variant="contained" component={Link} to="/bikes" className="cta-primary">
              Browse Bikes
            </Button>
            <Button variant="outlined" component={Link} to="/about" className="cta-secondary">
              Learn More
            </Button>
          </div>
        </div>
      </section>

      {/* Bike Categories Section */}
      <div className="vehicle-sections">
        <Box className="category-section">
          <BikeCategoriesFilter />
        </Box>
      </div>
    </div>
  );
}

export default Landing;