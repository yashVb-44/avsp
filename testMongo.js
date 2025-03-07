const mongoose = require("mongoose");
require("dotenv").config();

const MONGO_URI = "mongodb+srv://doadmin:18uKrZyE9450Ov36@db-mongodb-blr1-70822-213c9e13.mongo.ondigitalocean.com/sowi?tls=true&authSource=admin&replicaSet=db-mongodb-blr1-70822";

console.log("Trying to connect to:", MONGO_URI);

mongoose
  .connect(MONGO_URI, { useNewUrlParser: true, useUnifiedTopology: true })
  .then(() => {
    console.log("✅ MongoDB Connected Successfully!");
    process.exit();
  })
  .catch((err) => {
    console.error("❌ MongoDB Connection Failed:", err.message);
    process.exit(1);
  });
