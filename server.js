import express, { urlencoded } from 'express';
import dotenv from 'dotenv';
import cors from 'cors'; 
import connectDB from './db/connectDB.js';
import cookieParser from 'cookie-parser';

import userRoutes from './routes/userRoute.js';
import companyRoute from './routes/companyRoute.js'


dotenv.config();

connectDB();

const app = express();

// ✅ Enable CORS Middleware
app.use(cors({
    origin: "http://localhost:5173",
    methods: ["GET", "POST", "PUT", "DELETE"],
    credentials: true, // Allow cookies if needed
}));

app.use(express.json()); // Middleware to parse JSON data
app.use(urlencoded({ extended: true })); // Middleware to parse form data
app.use(cookieParser()); // Middleware to parse cookies

app.get('/', (req, res) => {
    res.send('Server is running...');
});

app.use('/api/users', userRoutes); // Mounting the user routes
app.use('/api/company', companyRoute);

const PORT = process.env.PORT || 5000; 

app.listen(PORT, () => {
    console.log(`"Server started at http://localhost:${PORT} Punjabi Pages"`);
});