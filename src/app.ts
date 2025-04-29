require('dotenv').config()

import express from 'express'
import config from 'config'
import connectToDb from './utils/connectToDb';
import log from './utils/logger';
import router from './routes'
import {errorHandler} from './middlware/error.handler';
import deserializeUser from './middlware/deserializeUser';
import cookieParser from "cookie-parser";
import cors from 'cors'
import http from 'http';
import { SocketService } from './service/socket/socket.service';

const app = express();
const server = http.createServer(app);

// Initialize Socket.IO service
// new SocketService(server);

// Configure cors
app.use(cors());
app.use(express.json());
app.use(deserializeUser);
app.use(cookieParser());
app.use(router);
app.use(errorHandler);

const port = config.get("port");

connectToDb().then(() => {
    server.listen(port, () => {
        log.info(`Server is running at http://localhost:${port}`)
    })
}).catch((e) => {
    log.error(e)
    process.exit(1)
})