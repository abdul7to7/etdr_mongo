const express = require("express");
require("dotenv").config();

const cors = require("cors");
const helmet = require("helmet");
const compression = require("compression");
const morgan = require("morgan");
const fs = require("fs");
const path = require("path");

const app = express();

app.use(express.urlencoded({ extended: true }));
app.use(express.json());
app.use(helmet());
app.use(compression());

const accessLogStream = fs.createWriteStream(
  path.join(__dirname, "access.log"),
  { flags: "a" }
);
app.use(morgan("combined", { stream: accessLogStream }));

app.use(
  cors({
    // origin: ["https://etdr-mongo-frontend.onrender.com"],
    origin: "*",
  })
);

const userRoutes = require("./Routes/userRoutes");
const expenseRoutes = require("./Routes/expenseRoutes");
const purchaseRoutes = require("./Routes/purchaseRoutes");
const filesRoutes = require("./Routes/filesRoutes");
const expenseFeaturesRoutes = require("./Routes/expenseFeaturesRoutes");

const authenticate = require("./middleware/authenticate");

const isPremium = require("./middleware/isPremium");
const connectToDb = require("./util/db");

app.use("/user", userRoutes);
app.use("/expense", authenticate, expenseRoutes);
app.use("/purchase", authenticate, purchaseRoutes);
app.use("/expense_features", authenticate, isPremium, expenseFeaturesRoutes);
app.use("/files", authenticate, isPremium, filesRoutes);

app.use("/", (req, res) => {
  res.status(404).send("Page not found");
});

(async () => {
  const PORT = process.env.PORT || 3000;
  const MONGO_URI = process.env.URI;
  try {
    await connectToDb(MONGO_URI); // Connect to MongoDB
    app.listen(PORT, () => {
      console.log(`Server running on http://localhost:${PORT}`);
    });
  } catch (error) {
    console.error("Failed to start the application:", error.message);
    process.exit(1);
  }
})();
