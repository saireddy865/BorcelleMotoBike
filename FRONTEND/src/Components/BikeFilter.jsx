import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import axios from 'axios';
import './styles/BikeFilter.css';

function BikeFilter() {
  const { category } = useParams();
  const navigate = useNavigate();
  const [bikes, setBikes] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchBikes = async () => {
      try {
        setLoading(true);
        const response = await axios.get(`http://localhost:4700/bikecat/${category}`);
        if (response.data.success) {
          setBikes(response.data.bikes);
        } else {
          setError(response.data.message || 'No bikes found in this category');
        }
      } catch (err) {
        setError('Failed to fetch bikes. Please try again later.');
        console.error('Fetch error:', err);
      } finally {
        setLoading(false);
      }
    };

    fetchBikes();
  }, [category]);

  const handleBookNow = (bikeId) => {
    if (!bikeId) {
      console.error('Bike ID is undefined');
      return;
    }
    console.log('Navigating to booking with bike_id:', bikeId);
    navigate(`/bookings/${bikeId}`);
  };

  const handleBackToHome = () => {
    navigate('/home');
  };

  return (
    <div className="bike-filter-container">
      <div className="header-container">
        <h2 className="filter-heading">{category.toUpperCase()} BIKES</h2>
        <button
          className="back-button"
          onClick={handleBackToHome}
          title="Back to Home"
        >
          ← Back
        </button>
      </div>
      
      {loading && <p className="loading">Loading bikes...</p>}
      {error && <p className="error">{error}</p>}
      
      {!loading && !error && bikes.length === 0 && (
        <p className="no-bikes">No bikes found in this category.</p>
      )}
      
      <div className="bike-grid">
        {bikes.map((bike) => (
          <div key={bike._id} className="bike-card">
            <div className="bike-image-container">
              <img
                src={bike.image || '/images/default-bike.jpg'}
                alt={bike.bike_name}
                className="bike-image"
                onError={(e) => {
                  e.target.src = '/images/default-bike.jpg';
                }}
              />
            </div>
            <div className="bike-details">
              <h3 className="bike-name">{bike.bike_name}</h3>
              <p className="bike-model">Model: {bike.bike_model}</p>
              <p className="bike-type">Type: {bike.bike_type}</p>
              <p className="bike-enginetype">Engine: {bike.bike_enginetype}</p>
              <p className="bike-price">Price: ₹{bike.bike_price?.toLocaleString()}</p>
              <p className="bike-availability">
                Availability: {bike.available ? 'Available' : 'Not Available'}
              </p>
              <button
                className="book-now-button"
                onClick={() => handleBookNow(bike.bike_id)}
                disabled={!bike.available}
              >
                Book Now
              </button>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

export default BikeFilter;