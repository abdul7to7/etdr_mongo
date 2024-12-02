const mongoose = require("mongoose");

// Define the User schema
const userSchema = new mongoose.Schema(
  {
    username: {
      type: String, // Use String for username
      required: true, // Make it a required field
    },
    mail: {
      type: String, // Use String for mail
      required: true, // Make it a required field
      unique: true, // Ensure mail is unique
    },
    password: {
      type: String, // Use String for password
      required: true, // Make it a required field
    },
    isPremium: {
      type: Boolean, // Use Boolean for isPremium
      required: true, // Make it a required field
      default: false, // Default value is false
    },
    totalExpense: {
      type: Number, // Use Number for totalExpense (equivalent to Sequelize.DOUBLE)
      required: true, // Make it a required field
      default: 0, // Default value is 0
    },
  },
  {
    timestamps: true, // Automatically adds `createdAt` and `updatedAt` fields
  }
);

// Create the User model
const User = mongoose.model("User", userSchema);

module.exports = User;
