import express from "express";
import upload from "../Middleware/multer.js";
import { email, mobileNumber, name, newPassword, password } from "../Middleware/validation.js";
import { Register, Login, forgotpassword, updatepassword, getUser, getBikesCat,createBikeBooking, getBikeById } from "../Controllers/userController.js";

const userRoute = express.Router()
userRoute.post('/register', name, email, mobileNumber, password, Register);
userRoute.post('/login',Login)
// userRoute.put('/users/:user_id',updateUsers)  //  for updating users
userRoute.post('/bookings',createBikeBooking)
userRoute.get('/user',getUser)

userRoute.get('/bikes/:bike_id',getBikeById)
userRoute.post('/forgotpassword', forgotpassword)
userRoute.patch('/updatepassword',newPassword, updatepassword)
userRoute.get('/bikecat/:category',getBikesCat)


export default userRoute;