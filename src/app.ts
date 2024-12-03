
// Third Party Modules
require('dotenv').config();
import express from 'express';
import http from 'http';
import cors from 'cors';
import { log } from 'console';

const app = express();

app.use(cors());

app.use(express.json());

export default http.createServer(app);