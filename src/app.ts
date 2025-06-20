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

import { ShelfFirebaseService } from './service/firebase/shelf.firebase.service';
import { ShelfSocketService } from './service/socket/shelf.socket.service';

const app = express();
const server = http.createServer(app);

new ShelfFirebaseService();

try {
    new ShelfSocketService(server);
    log.info('ShelfSocketService started successfully');
  } catch (err) {
    log.error('Failed to initialize ShelfSocketService:', err instanceof Error ? err.message : String(err));
    process.exit(1);
  }
  

// Initialize Socket.IO service
try {
    let socketService = new SocketService(server);
    log.info('SocketService started successfully');
} catch (error) {
    log.error(`Failed to initialize SocketService: ${error instanceof Error ? error.message : String(error)}`);
    process.exit(1);
}

// Configure cors
app.use(cors());
app.use(express.json());
app.use(deserializeUser);
app.use(cookieParser());
app.use(router);
app.use(errorHandler);

const port = config.get("port");

connectToDb().then(() => {
    server.listen(Number(port), '0.0.0.0', () => {
        log.info(`Server is running on port ${port}`)
    })
}).catch((e) => {
    log.error(e)
    process.exit(1)
})