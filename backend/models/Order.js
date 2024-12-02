const mongoose = require("mongoose");

// Define the Order schema
const orderSchema = new mongoose.Schema(
  {
    status: {
      type: String, // Use String for status
      required: true, // Ensure status is required
      default: "Pending", // Set default value as 'Pending'
    },
    rzpOrderId: {
      type: String, // Use String for rzpOrderId
      required: false, // Not mandatory
    },
    paymentId: {
      type: String, // Use String for paymentId
      required: false, // Not mandatory
    },
    userId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
  },
  {
    timestamps: true, // Automatically adds `createdAt` and `updatedAt` fields
  }
);

// Create the Order model
const Order = mongoose.model("Order", orderSchema);

module.exports = Order;
