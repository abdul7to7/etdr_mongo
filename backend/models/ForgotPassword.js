const mongoose = require("mongoose");

// Define the ForgotPassword schema
const forgotPasswordSchema = new mongoose.Schema(
  {
    id: {
      type: String, // Use String for the ID field
      required: true, // Make it a required field
      unique: true, // Make the ID unique (equivalent to primaryKey in Sequelize)
    },
    isActive: {
      type: Boolean, // Use Boolean for isActive field
      default: true, // Set the default value to true
    },
    userId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
  },
  {
    timestamps: true, // Automatically add `createdAt` and `updatedAt` fields
  }
);

// Create the ForgotPassword model
const ForgotPassword = mongoose.model("ForgotPassword", forgotPasswordSchema);

module.exports = ForgotPassword;
