const mongoose = require("mongoose");

// Define the Expense schema
const expenseSchema = new mongoose.Schema(
  {
    amount: {
      type: Number, // Use Number for amount instead of Sequelize.DOUBLE
      required: true, // Make it a required field
    },
    description: {
      type: String, // Use String for description
      required: true, // Make it a required field
    },
    category: {
      type: String, // Use String for category
      required: true, // Make it a required field
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

// Create the Expense model
const Expense = mongoose.model("Expense", expenseSchema);

module.exports = Expense;
