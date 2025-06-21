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
import { Server } from 'socket.io';
import { SocketService } from './service/socket/cart.socket.service';

import { ShelfFirebaseService } from './service/firebase/shelf.firebase.service';
import { ShelfSocketService } from './service/socket/shelf.socket.service';

const app = express();
const server = http.createServer(app);

// Create a single Socket.IO server instance
const io = new Server(server, {
    cors: {
        origin: "*",
        methods: ["GET", "POST", "PUT"]
    }
});

new ShelfFirebaseService();

try {
    // Create separate namespaces for each service
    const cartNamespace = io.of('/cart');
    const shelfNamespace = io.of('/shelf');
    
    new ShelfSocketService(shelfNamespace);
    log.info('ShelfSocketService started successfully');
    
    let socketService = new SocketService(cartNamespace);
    log.info('SocketService started successfully');
} catch (error) {
    log.error(`Failed to initialize Socket services: ${error instanceof Error ? error.message : String(error)}`);
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