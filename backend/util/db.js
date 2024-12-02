const mongoose = require("mongoose");
const connectToDb = async (uri) => {
  try {
    await mongoose.connect(uri, {
      useNewUrlParser: true,
      useUnifiedTopology: true,
    });
    console.log("Connected to MongoDB with Mongoose");
  } catch (error) {
    console.error("Database connection error:", error);
    throw error;
  }
};
module.exports = connectToDb;
