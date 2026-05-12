const mongoose = require("mongoose");

async function connectDB() {
    try {
        mongoose.set("strictQuery", true);

        const conn = await mongoose.connect(process.env.MONGO_URI);

        console.log("DataBase connected successfully");
    } catch (error) {
        console.error("❌ MongoDB connection error:", error.message);
        process.exit(1);
    }
}

module.exports = connectDB;