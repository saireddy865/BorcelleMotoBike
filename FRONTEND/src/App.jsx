import { useState } from 'react'
import reactLogo from './assets/react.svg'
import viteLogo from '/vite.svg'
import './App.css'
import Header from './Components/Header'
import { BrowserRouter, Route, Routes } from 'react-router-dom'
import Home from './Routes/Home'
import Landing from './Pages/Client/Landing'
import Login from './Pages/Client/Login'
import Register from './Pages/Client/Register'
import AdminLogin from './Pages/Admin/AdminLogin'
import AdminDashboardBikes from './Pages/Admin/AdminDashboard'
import ServiceBanner from './Components/ServiceBanner'
import BikeFilter from './Components/BikeFilter'
import BikeBookings from './Pages/Client/Booking'

function App() {
  const [count, setCount] = useState(0)

  return (
    <>
    <BrowserRouter>
      < Header/>
      <Routes>
        {/* <Route path="/home" element={<Home />} /> */}
        <Route path="/home" element={<Landing/>} />
        <Route path="/login" element={<Login/>} />
        <Route path="/register" element={<Register/>} />
        <Route path="/services" element={<ServiceBanner/>} />
        <Route path="/admin/login" element={<AdminLogin/>} />
        <Route path="/admin/dashboard" element={<AdminDashboardBikes/>} />
        <Route path="/bikes/:category" element={<BikeFilter/>} />
        <Route path="/bookings/:bike_id" element={<BikeBookings/>} />


      </Routes>
    </BrowserRouter>
    </>
  )
}

export default App
