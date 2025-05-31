import mongoose from "mongoose";

const bikeSchema = new mongoose.Schema(
  {
    bike_id: {
      type: String,
      required: [true, "Bike ID is required"],
      unique: true, // Ensure bike_id is unique
      trim: true, // Remove whitespace
    },
    bike_name: {
      type: String,
      required: [true, "Bike name is required"],
      trim: true,
    },
    bike_model: {
      type: String,
      required: [true, "Bike model is required"],
      trim: true,
    },
    bike_type: {
      type: String,
      required: [true, "Bike type is required"],
      enum: {
        values: [
          "Sport",
          "Touring",
          "Standard",
          "Scooty",
          "Adventure",
        ], // Common bike types
        message: "{VALUE} is not a valid bike type",
      },
      trim: true,
    },
    bike_enginetype: {
      type: String,
      required: [true, "Engine type is required"],
      enum: {
        values: ["Petrol", "Electric"], // Common bike engine types
        message: "{VALUE} is not a valid engine type",
      },
      trim: true,
    },
    bike_price: {
      type: Number,
      required: [true, "Bike price is required"],
      min: [0, "Price cannot be negative"],
    },
    image: {
      type: String,
      required: [true, "Image URL is required"],
      trim: true,
      match: [/^https?:\/\/.+/, "Please provide a valid image URL"],
    },
    available: {
      type: Boolean,
      required: [true, "Availability status is required"],
      default: true, // Default to true if not specified
    },
  },
  {
    timestamps: true, // Automatically add createdAt and updatedAt
  }
);

// Use singular, capitalized model name for convention
const Bike = mongoose.models.Bike || mongoose.model("Bike", bikeSchema);

export default Bike;