import React from 'react';
import { useNavigate } from 'react-router-dom';
import '../styles/BikeCategories.css'; // Reusing the same CSS

const bikeCategories = [
  "Sport",
  "Touring",
  "Standard",
  "Scooty",
  "Adventure"
];

const bikeImages = {
  'Sport': "../../../public/sport.jpg",
  'Touring': "../../../public/touring.jpg",
  'Standard': "../../../public/standard.jpg",
  'Scooty': "../../../public/scooty.jpg",
  'Adventure': "../../../public/adventure.jpg"
};

function BikeCategoryFilter() {
  const navigate = useNavigate();

  const handleCategoryClick = (category) => {
    navigate(`/bikes/${category.toLowerCase().replace(' ', '-')}`);
  };

  return (
    <div className="category-container">
      <h2 className="category-heading">BIKE CATEGORIES</h2>
      
      <div className="category-grid">
        {bikeCategories.map((category) => (
          <div 
            key={category} 
            className="category-card"
            onClick={() => handleCategoryClick(category)}
          >
            <div className="image-container">
              <img 
                src={bikeImages[category]} 
                alt={category}
                className="category-image"
                onError={(e) => {
                  e.target.src = '/images/default-bike.jpg'; // Fallback image
                }}
              />
            </div>
           <div 
              className="category-name" 
              onClick={() => handleCategoryClick(category)}
              style={{ cursor: 'pointer', fontWeight: 'bold', color: '#007bff', padding: '10px', textAlign: 'center' }}
            >
              {category}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

export default BikeCategoryFilter;