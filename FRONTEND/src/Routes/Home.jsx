

import React, { useState, useEffect } from 'react';
import './Home.css';

const Home = () => {
  const [bikes, setBikes] = useState([]);
  const [error, setError] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchBikes = async () => {
      try {
        const response = await fetch('https://borcellemotobike.onrender.com');
        if (!response.ok) {
          throw new Error('Failed to fetch Bike data');
        }
        const data = await response.json();
        setBikes(data);
      } catch (err) {
        setError(err.message);
      } finally {
        setLoading(false);
      }
    };
    fetchBikes();
  }, []);

  if (loading) {
    return <div className="text-center mt-4">Loading...</div>;
  }

  if (error) {
    return <div className="text-red-500 text-center mt-4">Error: {error}</div>;
  }

  return (
    <div className="container mx-auto p-4">
      <h1 className="text-3xl font-bold text-center mb-6">Bike Collection</h1>
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
        {bikes.map((bike) => (
          <div key={bike.id} className="bike-card bg-white shadow-lg rounded-lg overflow-hidden">
            <img src={bike.image} alt={bike.model} className="w-full h-48 object-cover" />
            <div className="p-4">
              <h2 className="text-xl font-semibold">{bike.model}</h2>
              <p className="text-gray-600">Year: {bike.modelYear}</p>
              <p className="text-gray-600">Type: {bike.bikeType}</p>
              <p className="text-gray-600">Location: {bike.location || 'N/A'}</p>
              <p className="text-gray-600">Condition: {bike.condition}</p>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

export default Home;
