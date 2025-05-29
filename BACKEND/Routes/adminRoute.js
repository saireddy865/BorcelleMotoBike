import express from "express";
import {addBike,addAdmin,adminLogin,getBikes,editBike} from "../Controllers/adminController.js";
import upload from "../Middleware/multer.js";
import { adminPassword, password } from "../Middleware/validation.js";

const adminRoute = express.Router();

adminRoute.post('/addBikes', upload.single("image"), addBike);
adminRoute.get("/bikes",getBikes);
adminRoute.post("/login",adminLogin)
adminRoute.post("/sign",adminPassword,addAdmin)
adminRoute.put('/bikes/:id', upload.single('imagefile'), editBike);

export default adminRoute;