import  Bike  from "../Models/bikeModel.js"; // Adjust path to your bikeModel.js
import  adminModel  from "../Models/adminModel.js"; // Adjust path to your bikeModel.js
import jwt from "jsonwebtoken"
import cloudinary from "cloudinary";
import dotenv from "dotenv";
dotenv.config()


export const addBike = async (req, res) => {
  try {
    const data = req.body;
    const imagefile = req.file;

    // Generate unique bike_id
    const bikeCount = await Bike.countDocuments();
    const nextIdNumber = bikeCount + 1;
    const bike_id = `bike${String(nextIdNumber).padStart(3, "0")}`;

    // Upload image to Cloudinary
    const imageUpload = await cloudinary.uploader.upload(imagefile.path, {
      resource_type: "image",
    });
    const image = imageUpload.secure_url;

    // Prepare bike data
    const bikeData = {
      ...data,
      bike_id,
      image,
      available: data.available ?? true, // Use default if not provided
    };

    // Save to DB
    const newBike = new Bike(bikeData);
    await newBike.save();

    res.status(200).json({
      success: true,
      message: "bike added successfully",
    });
  } catch (error) {
    console.error("Error adding bike:", error);
    res.status(400).json({ success: false, message: "Failed to add bike" });
  }
};

export const getBikes = async (req, res) => {
    try {
        const allBikes = await Bike.find()
        res.status(200).json(allBikes)
    } catch (error) {
        res.status(400).json({ success: false, message: 'Failed get the bike', error })
    }
}
export const editBike = async (req, res) => {
  try {
    const bikeId = req.params.id; // Changed from req.params.bikeId to req.params.id
    const data = req.body;
    const imagefile = req.file;
    console.log('Editing bike with params.id:', { id: bikeId, body: data, file: imagefile ? imagefile.name : null });

    // Find the bike to update
    const bike = await Bike.findOne({ bike_id: bikeId });
    if (!bike) {
      console.log('bike not found for id:', bikeId);
      return res.status(404).json({
        success: false,
        message: "bike not found",
      });
    }

    // Update image if new image is provided
    let image;
    if (imagefile) {
      // Upload new image to Cloudinary
      const imageUpload = await cloudinary.uploader.upload(imagefile.path, {
        resource_type: "image",
      });
      image = imageUpload.secure_url;
      console.log('Uploaded image to Cloudinary:', image);
    } else {
      // Keep the existing image
      image = bike.image;
      console.log('Using existing image:', image);
    }

    // Prepare updated bike data
    const updatedBikeData = {
      ...bike.toObject(),
      ...data,
      image,
      available: data.available ?? bike.available,
    };

    // Update bike in DB
    const updatedBike = await Bike.findOneAndUpdate({ bike_id: bikeId }, updatedBikeData, {
      new: true,
    });

    console.log('bike updated successfully:', updatedBike);

    res.status(200).json({
      success: true,
      message: "bike updated successfully",
      bike: updatedBike,
    });
  } catch (error) {
    console.error("Error updating bike:", error);
    res.status(400).json({
      success: false,
      message: "Failed to update bike",
      error: error.message,
    });
  }
};
//admin login-------------------------------------------------------------------------------------------------------------------------------------

export const adminLogin = async (req, res) => {
    try {
        const { adminid, adminPassword } = req.body;

        const admin = await adminModel.findOne({ adminid })
        if (!admin) {
            return res.status(404).json({ sucess: false, message: 'Admin Not Found' })
        }
        const isValidPassword = adminPassword === admin.adminPassword
        if (!isValidPassword) {
            return res.status(401).json({ sucess: false, message: 'Enter Correct Password' })
        }

        let token = jwt.sign({ adminid }, process.env.LOGIN_SECRET_KEY)
        res.status(200).json({ sucess: true, message: 'Login Sucessful', token })


    } catch (error) {
        console.log(error)
        res.status(400).json({ success: false, message: 'Failed to Login' })
    }
}

export const addAdmin = async (req, res) => {
  try {
    const { adminid, adminPassword } = req.body;

    // Check if admin already exists
    const existingAdmin = await adminModel.findOne({ adminid });
    if (existingAdmin) {
      return res.status(400).json({
        success: false,
        message: 'Admin already exists',
      });
    }

    // Create new admin
    const newAdmin = new adminModel({
      adminid,
      adminPassword,
    });

    // Save admin to database
    await newAdmin.save();

    res.status(201).json({
      success: true,
      message: 'Admin added successfully',
    });
  } catch (error) {
    console.log(error);
    res.status(500).json({
      success: false,
      message: 'Failed to add admin',
    });
  }
};