import cors from "cors";
import mongoose from "mongoose";
import "dotenv/config";
import ChatRouter from "./routes/chat.routes.js";


import dns from "dns";
dns.setServers(["1.1.1.1", "8.8.8.8"]);


import express from 'express';
const app = express();


// middleware
app.use(cors());
app.use(express.json());



app.use("/api", ChatRouter);

app.get("/health", (req, res) => {
    res.status(200).json({ status: "ok" });
});

app.get("/", (req, res) => {
    res.send("Hello");
});



const connectDB = async () => {
    try {
        await mongoose.connect(process.env.MONGO_URL);
        console.log("Connected to MongoDB");
    } catch (err) {
        console.error("Error connecting to MongoDB:", err);
    }
};

const port = process.env.PORT || 8080;

app.listen(port, () => {
    console.log(`Server is running on port ${port}`);
    connectDB();
});
