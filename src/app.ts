
// Third Party Modules
require('dotenv').config();
import express from 'express';
import http from 'http';
import cors from 'cors';
import { log } from 'console';

// Local Modules
import authRouter from './routes/authRouter'

// Express App
const app = express();

// Middlewares
app.use(cors());

// Setting up the bodyParser
app.use(express.json());
app.use(express.urlencoded({ extended: false }));

// Routes
app.use('/api/auth' , authRouter)

export default http.createServer(app);