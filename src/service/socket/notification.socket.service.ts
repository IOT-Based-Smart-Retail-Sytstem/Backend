import { Socket, Namespace } from 'socket.io';
import { CustomError } from '../../utils/custom.error';
import { Code } from '../../utils/httpStatus';
import { verifyJwt } from '../../utils/jwt';
import * as notificationService from '../notification.service';

export class NotificationSocketService {
    private io: Namespace;

    constructor(io: Namespace) {
        this.io = io;
        this.io.use(this.authenticateSocket);
        this.setupSocketHandlers();
    }

    private authenticateSocket = async (socket: Socket, next: (err?: Error) => void) => {
        try {
            const token = socket.handshake.auth.token;
            if (!token) {
                throw new CustomError('Authentication token required', Code.Unauthorized);
            }
            const decoded = verifyJwt<{ _id: string }>(token, 'accessTokenPublicKey');
            if (!decoded || !decoded._id) {
                throw new CustomError('Invalid token', Code.Unauthorized);
            }
            socket.handshake.auth.userId = decoded._id;
            next();
        } catch (error) {
            next(error instanceof Error ? error : new Error('Authentication failed'));
        }
    }

    private handleError(socket: Socket, error: unknown, event: string) {
        const errorMessage = error instanceof Error ? error.message : 'An unknown error occurred';
        const errorCode = error instanceof CustomError ? error.statusCode : Code.InternalServerError;
        socket.emit('error', {
            success: false,
            event,
            code: errorCode,
            message: errorMessage
        });
    }

    private getUserIdFromSocket(socket: Socket): string {
        const userId = socket.handshake.auth.userId;
        if (!userId) {
            throw new CustomError('User not authenticated', Code.Unauthorized);
        }
        return userId;
    }

    private setupSocketHandlers() {
        this.io.on('connection', (socket: Socket) => {
            console.log('Notification client connected:', socket.id);
            const userId = this.getUserIdFromSocket(socket);

            // Get all notifications
            socket.on('get-notifications', async () => {
                try {
                    const notifications = await notificationService.getUserNotifications(userId);
                    socket.emit('notifications', notifications);
                } catch (error) {
                    this.handleError(socket, error, 'get-notifications');
                }
            });

            // Mark all as read
            socket.on('mark-all-as-read', async () => {
                try {
                    await notificationService.markAllAsRead(userId);
                    const notifications = await notificationService.getUserNotifications(userId);
                    socket.emit('notifications', notifications);
                } catch (error) {
                    this.handleError(socket, error, 'mark-all-as-read');
                }
            });

            // Clear all notifications
            socket.on('clear-all-notifications', async () => {
                try {
                    await notificationService.clearAll(userId);
                    socket.emit('notifications', []);
                } catch (error) {
                    this.handleError(socket, error, 'clear-all-notifications');
                }
            });

            // Clear a specific notification
            socket.on('clear-notification', async (notificationId: string) => {
                try {
                    await notificationService.clearNotification(userId, notificationId);
                    socket.emit('notification-cleared', notificationId);
                } catch (error) {
                    this.handleError(socket, error, 'clear-notification');
                }
            });
        });
    }

    // For emitting new notifications to a user
    public async sendNotification(userId: string, notificationData: any) {
        try {
            const notification = await notificationService.createNotification(notificationData);
            this.io.to(userId).emit('new-notification', notification);
            return notification;
        } catch (error) {
            throw error;
        }
    }
} 