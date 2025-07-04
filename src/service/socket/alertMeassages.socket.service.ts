import { Socket, Namespace } from 'socket.io';
import { CustomError } from '../../utils/custom.error';
import { Code } from '../../utils/httpStatus';
import { verifyJwt } from '../../utils/jwt';
import { EventEmitter } from 'events';
import * as alertService from '../alertMeassge.service';

export class AlertMeassagesSocketService {
    private io: Namespace;
    private eventEmitter: EventEmitter;

    constructor(io: Namespace) {
        this.io = io;
        this.eventEmitter = new EventEmitter();
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

    // Only creates the alert and emits an event
    public async sendInventoryAlert({ productTitle, userId }: { productTitle: string, userId: string }) {
        const alert = await alertService.createInventoryAlert({ productTitle, userId });
        this.eventEmitter.emit('inventory-alert', { userId, alert });
        return alert;
    }

    private setupSocketHandlers() {
        this.io.on('connection', (socket: Socket) => {
            console.log('Notification client connected:', socket.id);

            // Listen for inventory-alert events and emit to the user
            this.eventEmitter.on('inventory-alert', ({ userId, alert }) => {
                this.io.to(userId).emit('Inventory-Alert', {
                    title: alert.title,
                    message: alert.message,
                    time: 'new',
                    createdAt: alert.createdAt
                });
            });

            // Get all alerts with correct time labels
            socket.on('get-alert-messages', async () => {
                try {
                    const userId = this.getUserIdFromSocket(socket);
                    const alerts = await alertService.getUserAlertsWithTime(userId);
                    socket.emit('alert-messages', alerts);
                } catch (error) {
                    this.handleError(socket, error, 'get-alert-messages');
                }
            });

            // Mark all as read
            socket.on('mark-all-as-read', async () => {
                try {
                    const userId = this.getUserIdFromSocket(socket);
                    await alertService.markAllAsRead(userId);
                    const alerts = await alertService.getUserAlertsWithTime(userId);
                    socket.emit('notifications', alerts);
                } catch (error) {
                    this.handleError(socket, error, 'mark-all-as-read');
                }
            });

            // Clear all notifications
            socket.on('clear-all-notifications', async () => {
                try {
                    const userId = this.getUserIdFromSocket(socket);
                    await alertService.clearAll(userId);
                    socket.emit('notifications', []);
                } catch (error) {
                    this.handleError(socket, error, 'clear-all-notifications');
                }
            });

            // Clear a specific alert
            socket.on('clear-alert', async (alertId: string) => {
                try {
                    const userId = this.getUserIdFromSocket(socket);
                    await alertService.clearAlert(userId, alertId);
                    const alerts = await alertService.getUserAlertsWithTime(userId);
                    socket.emit('notifications', alerts);
                } catch (error) {
                    this.handleError(socket, error, 'clear-alert');
                }
            });
        });
    }

    public getIO(): Namespace {
        return this.io;
    }
}
