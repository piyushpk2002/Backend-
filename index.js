import express, { urlencoded } from "express";
import dotenv from "dotenv";
import cors from "cors";
import connectDB from "./src/db/connectDB.js";
import cookieParser from "cookie-parser";

import userRoutes from "./src/routes/userRoute.js";
import companyRoute from "./src/routes/companyRoute.js";
import multer from "multer";
import { upload } from "./src/middleware/multer.middleware.js";

dotenv.config({
  path: "./config/.env",
});

connectDB();

const app = express();

// Enable CORS Middleware
app.use(
  cors({
    origin: [
      "http://localhost:5173",
      "https://t5bj8gmz-5173.inc1.devtunnels.ms",
      "https://punjabi-26.vercel.app/",
      "https://punjabi-26.vercel.app",
    ],
    methods: ["GET", "POST", "PUT", "DELETE"],
    credentials: true, // Allow cookies if needed
  })
);

app.use(express.json()); // Middleware to parse JSON data
app.use(urlencoded({ extended: true })); // Middleware to parse form data
app.use(cookieParser()); // Middleware to parse cookies

app.get("/", (req, res) => {
  res.send("Server is running...");
});

app.use("/api/users", userRoutes); // Mounting the user routes
app.use("/api/company", companyRoute);

// app.use("api/company/count", companyRoute);

app.post("/upload", upload.single("profileImage"), (req, res) => {
  console.log(req.body);
  console.log(req.file);
  res.json({ message: "File uploaded successfully", file: req.file });
});
const PORT = process.env.PORT || 5000;

app.listen(PORT, () => {
  console.log(`"Server started at http://localhost:${PORT} Punjabi Pages"`);
});
