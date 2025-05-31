import { v2 as cloudinary } from "cloudinary";
import  Bike  from "../Models/bikeModel.js";
import bcrypt from "bcryptjs";
import nodemailer from 'nodemailer';
import { generateJWTToken, generateOtp } from "../Utility/utility.js";


import userModel from '../Models/userModel.js'; // Adjust path as needed
import jwt from 'jsonwebtoken';

export const Register = async (req, res) => {
  try {
    const userData = req.body;

    // Additional validation (already validated by middleware, but good practice to double-check)
    const requiredFields = ['name', 'email', 'password', 'mobileNumber', 'age', 'gender'];
    for (let field of requiredFields) {
      if (!userData[field] || (typeof userData[field] === 'string' && userData[field].trim() === '')) {
        return res.status(400).json({
          success: false,
          message: `Missing required field: ${field}`,
        });
      }
    }

    // Convert mobileNumber to Number
    const mobileNumber = Number(userData.mobileNumber);
    if (isNaN(mobileNumber)) {
      return res.status(400).json({
        success: false,
        message: 'Mobile number must be a valid number',
      });
    }

    // Validate age
    const age = Number(userData.age);
    if (isNaN(age) || age < 18 || age > 100) {
      return res.status(400).json({
        success: false,
        message: 'Age must be a number between 18 and 100',
      });
    }

    // Check for email uniqueness (schema enforces it, but explicit check for better error message)
    const existingUser = await userModel.findOne({ email: userData.email });
    if (existingUser) {
      return res.status(400).json({
        success: false,
        message: 'Email already exists',
      });
    }

    // Generate userid (e.g., con001, con002)
    const userCount = await userModel.countDocuments();
    const nextIdNumber = userCount + 1;
    const userid = `con${String(nextIdNumber).padStart(3, '0')}`;

    // Set date as ISO string to match schema
    const date = new Date().toISOString();

    // Prepare user data
    const user = {
      ...userData,
      mobileNumber,
      age,
      userid,
      date,
    };

    // Save the user
    const newUser = new userModel(user);
    await newUser.save();

    // Generate JWT token (since Register.jsx expects it)
    const token = jwt.sign({ userId: newUser._id }, process.env.JWT_SECRET || 'your_jwt_secret', {
      expiresIn: '1h',
    });

    res.status(201).json({
      success: true,
      message: 'User Registered Successfully',
      token,
    });
  } catch (error) {
    console.error('Registration error:', error);
    if (error.code === 11000) {
      return res.status(400).json({
        success: false,
        message: 'Email already exists',
      });
    }
    res.status(500).json({
      success: false,
      message: 'Failed to register',
      error: error.message,
    });
  }
};

export const Login = async (req, res) => {
    try {
        const userData = req.body;
        console.log(userData)
        const { email, password } = userData;

        const user = await userModel.findOne({ email });
        if (!user) {
            return res.status(404).json({ status: false, message: 'User Not Found' });
        }

        const isPasswordMatched = await bcrypt.compare(password, user.password);
        if (!isPasswordMatched) {
            return res.status(401).json({ status: false, message: 'Invalid Credentials' });
        }

        const token = generateJWTToken(user);

        return res.status(200).json({
            status: true,
            message: "Login Successful",
            token,
            userid: user.userid
        });

    } catch (error) {
        console.error("Login Error:", error);
        return res.status(500).json({ status: false, message: 'Internal Server Error' });
    }
};

// Forgot password;
export const forgotpassword = async (req, res) => {
    const { email } = req.body
    const user = await userModel.findOne({ email })
    if (user) {
        const otp = generateOtp()

        const transporter = nodemailer.createTransport({
            service: "gmail",
            auth: {
                user: process.env.EMAIL,
                pass: process.env.EMAIL_PASS,
            },
        });

        const mailOptions = {
            from: "support@consulto.com",
            to: email,
            subject: "Your OTP TO RESET PASSWORD",
            text: `HI,
            ${otp} is your OTP to Reset Password.
            Please Do not share it with anyone.
            Team CONSULTO`,
        };

        try {
            await transporter.sendMail(mailOptions);
            res.status(200).json({ message: "OTP sent successfully", otp });
        } catch (err) {
            console.error("Mail error:", err);
            res.status(500).json({ error: "Failed to send OTP" });
        }
    }
    else {
        return res.status(404).json({ status: false, message: 'User Not Found, Please Register First' });
    }


}

// Update Password
export const updatepassword = async (req, res) => {
    try {
        const { email, newPassword } = req.body;
        const user = await userModel.findOne({ email })
        if (!user) {
            return res.status(404).json({ message: "User not found." });
        }
        user.password = newPassword;
        await user.save();

        res.status(200).json({ message: "Password updated successfully." });
    } catch (error) {
        console.error("Error updating password:", error);
        res.status(500).json({ message: "Failed to update password." });
    }
};



export const getUser = async (req, res) => {
  try {
    const token = req.headers.authorization?.split(' ')[1];
    if (!token) {
      return res.status(401).json({ success: false, message: 'No token provided' });
    }

    const decoded = jwt.verify(token, process.env.LOGIN_SECRET_KEY);
    console.log('Decoded token:', decoded); // Debug log to check token structure
    
    // Note: Using 'userid' (lowercase) to match your schema
    const user = await userModel.findOne({ userid: decoded.id || decoded.userId }).select('userid name -_id');
    
    if (!user) {
      return res.status(404).json({ success: false, message: 'User not found' });
    }

    res.status(200).json({ 
      success: true, 
      user: { 
        user_id: user.userid,  // Map to user_id for frontend
        username: user.name 
      } 
    });
  } catch (error) {
    console.error('Error in getUser:', error);
    if (error.name === 'JsonWebTokenError') {
      return res.status(401).json({ success: false, message: 'Invalid token' });
    }
    res.status(500).json({ success: false, message: 'Failed to fetch user', error: error.message });
  }
};

// -------------  bike filtering based on category  --------

export const getBikesCat = async (req, res) => {
  try {
    const category = req.params.category;
    const bikes = await Bike.find({ bike_type: { $regex: `^${category}$`, $options: 'i' } });
    if (!bikes || bikes.length === 0) {
      return res.status(404).json({ success: false, message: 'No bikes found in this category' });
    }
    res.status(200).json({ success: true, bikes });
  } catch (error) {
    res.status(400).json({ success: false, message: 'Failed to fetch bikes', error: error.message });
  }
};


// ---------  bookings -----------


export const getBikeById = async (req, res) => {
  try {
    const { bike_id } = req.params;
    const bike = await Bike.findOne({ bike_id });
    if (!bike) {
      return res.status(404).json({ success: false, message: 'Bike not found' });
    }

    res.status(200).json({ success: true, bike });
  } catch (error) {
    console.error('Error in getBikeById:', error);
    res.status(500).json({ success: false, message: 'Failed to fetch bike', error: error.message });
  }
};



export const createBikeBooking = async (req, res) => {
  try {
    const { bike_id, booking_date } = req.body;
    const token = req.headers.authorization?.split(' ')[1]; // Expecting "Bearer <token>"

    if (!token) {
      return res.status(401).json({ success: false, message: 'No token provided' });
    }

    if (!bike_id) {
      return res.status(400).json({ success: false, message: 'Bike ID is required' });
    }

    // Verify JWT token
    const decoded = jwt.verify(token, process.env.LOGIN_SECRET_KEY); // Ensure LOGIN_SECRET_KEY is set in .env
    const userId = decoded.userId; // Assuming token contains userId

    // Find user
    const user = await userModel.findOne({ user_id: userId });
    if (!user) {
      return res.status(404).json({ success: false, message: 'User not found' });
    }

    // Find bike
    const bike = await Bike.findOne({ bike_id });
    if (!bike) {
      return res.status(404).json({ success: false, message: 'Bike not found' });
    }

    if (!bike.available) {
      return res.status(400).json({ success: false, message: 'Bike is not available' });
    }

    // Create booking
    const booking = {
      bike_id: bike.bike_id,
      bike_name: bike.bike_name,
      bike_model: bike.bike_model,
      bike_type: bike.bike_type,
      bike_price: bike.bike_price,
      booking_date: booking_date ? new Date(booking_date) : new Date(),
    };

    // Validate booking_date
    if (booking_date && isNaN(Date.parse(booking_date))) {
      return res.status(400).json({ success: false, message: 'Invalid booking date' });
    }

    // Add booking to user's bookings array
    user.bookings.push(booking);
    await user.save();

    // Update bike availability
    bike.available = false;
    await bike.save();

    // Response
    res.status(201).json({
      success: true,
      message: 'Bike booking created successfully',
      user: {
        user_id: user.user_id,
        username: user.name, // Assuming name is username
        bookings: user.bookings,
      },
    });
  } catch (error) {
    console.error('Error in createBikeBooking:', error);
    if (error.name === 'JsonWebTokenError') {
      return res.status(401).json({ success: false, message: 'Invalid token' });
    }
    res.status(500).json({
      success: false,
      message: 'Failed to create bike booking',
      error: error.message,
    });
  }
};