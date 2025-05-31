import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { Button, CircularProgress } from '@mui/material';
import { toast, ToastContainer } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';
import '../styles/Booking.css';
import axios from 'axios';

function BikeBooking() {
  const { bike_id } = useParams();
  const navigate = useNavigate();
  const [user, setUser] = useState({ user_id: '', username: '' });
  const [bike, setBike] = useState(null);
  const [bookingDate, setBookingDate] = useState(new Date().toISOString().split('T')[0]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchData = async () => {
      try {
        setLoading(true);
        const token = localStorage.getItem('token');
        if (!token) {
          setError('Please log in to book a bike');
          return;
        }

        if (!bike_id) {
          setError('Invalid bike ID');
          return;
        }

        // Fetch user details
        const userResponse = await axios.get('http://localhost:4700/user', {
          headers: { Authorization: `Bearer ${token}` },
        });
        if (userResponse.data.success) {
          setUser(userResponse.data.user)
          console.log(userResponse.data.user);
        } else {
          setError('Failed to fetch user details: ' + (userResponse.data.message || 'Unknown error'));
        }

        // Fetch bike details
        const bikeResponse = await axios.get(`http://localhost:4700/bikes/${bike_id}`);
        if (bikeResponse.data.success) {
          setBike(bikeResponse.data.bike);
        } else {
          setError('Bike not found: ' + (bikeResponse.data.message || 'Unknown error'));
        }
      } catch (err) {
        setError('Failed to fetch data: ' + (err.response?.data?.message || err.message));
        console.error('Fetch error:', err);
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, [bike_id]);

  const handleConfirmBooking = async () => {
    try {
      const token = localStorage.getItem('token');
      const response = await axios.post(
        'http://localhost:4700/bookings',
        { bike_id, booking_date: bookingDate },
        { headers: { Authorization: `Bearer ${token}` } }
      );

      if (response.data.success) {
        toast.success(response.data.message, { position: 'top-right' });
        setTimeout(() => navigate('/home', { replace: true }), 3000);
      } else {
        toast.error(response.data.message || 'Booking failed', { position: 'top-right' });
      }
    } catch (err) {
      toast.error('Network error: ' + (err.response?.data?.message || err.message), { position: 'top-right' });
      console.error('Booking error:', err);
    }
  };

  const handleBackToHome = () => {
    navigate(`/bikes/${bike.bike_type}`);
  };

  if (loading) return <CircularProgress style={{ display: 'block', margin: '50px auto' }} />;
  if (error) return <p className="error">{error}</p>;

//   if (!user.user_id) {
//     return <p className="error">User ID is undefined. Please log in again.</p>;
//   }

  return (
    <section className="booking-container">
      <div className="header-container">
        <button className="back-button" onClick={handleBackToHome} title="Back to Home">
          ← Back
        </button>
        <h2 className="booking-heading">Book Your Bike</h2>
      </div>
      <div className="user-info">
        <p>User ID: {user.user_id}</p>
        <p>Username: {user.username}</p>
      </div>
      {bike && (
        <div className="bike-details">
          <h3>{bike.bike_name}</h3>
          <img
            src={bike.image || '/images/default-bike.jpg'}
            alt={bike.bike_name}
            className="bike-image"
            onError={(e) => (e.target.src = '/images/default-bike.jpg')}
          />
          <p>Model: {bike.bike_model}</p>
          <p>Type: {bike.bike_type}</p>
          <p>Engine: {bike.bike_enginetype}</p>
          <p>Price: ₹{bike.bike_price?.toLocaleString()}</p>
          <p>Availability: {bike.available ? 'Available' : 'Not Available'}</p>
          <input
            type="date"
            value={bookingDate}
            onChange={(e) => setBookingDate(e.target.value)}
            min={new Date().toISOString().split('T')[0]}
            className="date-input"
          />
          <Button
            variant="contained"
            className="confirm-button"
            onClick={handleConfirmBooking}
            disabled={!bike.available}
          >
            Confirm Booking
          </Button>
        </div>
      )}
      <ToastContainer />
    </section>
  );
}

export default BikeBooking;