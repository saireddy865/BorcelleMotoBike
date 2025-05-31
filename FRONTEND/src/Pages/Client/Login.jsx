import React, { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { TextField, Button } from '@mui/material';
import { toast, ToastContainer } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';
import '../styles/auth.css';

function Login() {
  const [formData, setFormData] = useState({
    email: '',
    password: '',
  });
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const navigate = useNavigate();

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData({ ...formData, [name]: value });
  };

  const validateForm = () => {
    if (!formData.email || !formData.password) {
      return { isValid: false, message: 'Please fill in all fields' };
    }

    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(formData.email)) {
      return { isValid: false, message: 'Please enter a valid email address' };
    }

    return { isValid: true };
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    const validation = validateForm();
    if (!validation.isValid) {
      toast.error(validation.message, { position: 'top-right' });
      return;
    }

    try {
      const response = await fetch('http://localhost:4700/login', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(formData),
      });

      const data = await response.json();

      if (response.ok && data.success) {  // Changed back to data.success to match login1
        toast.success(data.message, { position: 'top-right' });
        if (data.token) {
          localStorage.setItem('token', data.token);
          // Immediate navigation after successful login
          navigate('/home', { replace: true });
        }
      } else {
        toast.error(data.message || 'Login failed. Please try again.', { position: 'top-right' });
      }
    } catch (err) {
      toast.error('Network error. Please try again.', { position: 'top-right' });
      console.error(err);
    }
  };

  // Check for existing token on component mount
  useEffect(() => {
    const token = localStorage.getItem('token');
    if (token) {
      navigate('/home', { replace: true });
    }
  }, [navigate]);

  return (
    <section className="auth-container">
      <div className="auth-form">
        <h2>Login to Borcelle MotoBike</h2>
        <form onSubmit={handleSubmit}>
          <div className="form-group">
            <TextField
              required
              label="Email"
              type="email"
              name="email"
              value={formData.email}
              onChange={handleChange}
              placeholder="Enter your email"
              fullWidth
            />
          </div>
          <div className="form-group">
            <TextField
              required
              label="Password"
              type="password"
              name="password"
              value={formData.password}
              onChange={handleChange}
              placeholder="Enter your password"
              autoComplete="current-password"
              fullWidth
            />
          </div>
          <Button type="submit" variant="contained" className="auth-button">
            Login
          </Button>
        </form>
        <p className="auth-link">
          Don't have an account? <Link to="/register">Register here</Link>
        </p>
        <p className="auth-link">
          <Link to="/forgot-password">Forgot Password?</Link>
        </p>
      </div>
      <ToastContainer />
    </section>
  );
}

export default Login;