import express, { urlencoded } from 'express';
import dotenv from 'dotenv';
import connectDB from './db/connectDB.js';

import userRoutes from './routes/userRoute.js';
import cookieParser from 'cookie-parser';

dotenv.config();

connectDB();

const app = express();
const PORT = process.env.PORT || 5000;

app.use(express.json()); // Middleware to parse JSON data in req.body
app.use(urlencoded({extended: true})) // Middleware to parse form data in the req.body
app.use(cookieParser()); // Middleware to parse cookies in req.cookies

app.use('/api/users', userRoutes) // Mounting the user routes on /api/users

app.listen(PORT, () =>{console.log(`"server started at http://localhost:${PORT} Pujabi Pages"`)});