import React from 'react';
import { useNavigate } from 'react-router-dom';
import './styles/servicebanner.css';

function ServiceBanner() {
  const navigate = useNavigate();

  const navigateAdminLogin = () => {
    navigate('/admin/login');
  };

  return (
    <div className="bannerContainer">
      <div className="bannerDetails">
        <p className="mainText">
          Give Your bike to Rent <br />
          Share & Earn
        </p>
        <div className="subTextContainer">
          {/* <img src="/group-bikes.png" className="groupImage" alt="Group of bikes" /> */}
          <span>Simply list your bike on Borcelle MotoBike and start earning by renting it out hassle-free.</span>
        </div>
        <button className="adminLoginBtn" onClick={navigateAdminLogin}>
          Admin Login <i className="fa-solid fa-arrow-right"></i>
        </button>
      </div>
      <img src="/bike banner.png" className="bannerImage" alt="bike Banner" />
    </div>
  );
}

export default ServiceBanner;

{/* <Link to="/login" onClick={toggleMenu}>
                Log/Reg
              </Link> */}