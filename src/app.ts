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
import { ShelfSocketService } from './service/socket/shelf.socket.service';
import { NotificationSocketService } from './service/socket/notification.socket.service';
//import { TestSocketService } from './service/socket/test.socket.service';
//import { performanceMonitor, performanceMiddleware } from './utils/performance-monitor';

const app = express();
const server = http.createServer(app);

// Create a single Socket.IO server instance
export const io = new Server(server, {
    cors: {
        origin: "*",
        methods: ["GET", "POST", "PUT"]
    }
});

export let notificationSocketService: NotificationSocketService;

// Top-level, before the try block
export const cartNamespace = io.of('/cart');

try {
    // Create separate namespaces for each service
    const shelfNamespace = io.of('/shelf');
    const notificationNamespace = io.of('/notifications');
    
    new ShelfSocketService(shelfNamespace);
    log.info('ShelfSocketService started successfully');
    
    new SocketService(cartNamespace);
    log.info('SocketService started successfully');

    // Initialize notification socket service
    notificationSocketService = new NotificationSocketService(notificationNamespace);
    log.info('NotificationSocketService started successfully');

    // Initialize test socket service (no authentication required)
   // new TestSocketService(testNamespace);
    //log.info('TestSocketService started successfully');
} catch (error) {
    log.error(`Failed to initialize Socket services: ${error instanceof Error ? error.message : String(error)}`);
    process.exit(1);
}

// Start performance monitoring
//performanceMonitor.startMonitoring();

// Configure cors
app.use(cors());

// Add performance monitoring middleware
//app.use(performanceMiddleware);

app.use((req, res, next) => {
  if (req.originalUrl.startsWith('/api/payment/webhook')) {
    next();
  } else {
    express.json()(req, res, next);
  }
});

// General middleware for all other routes
// app.use(express.json());
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