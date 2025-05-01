import { Server, Socket } from 'socket.io';
import { FirebaseService } from '../firebase/firebase.service';
import { CustomError } from '../../utils/custom.error';
import { Code } from '../../utils/httpStatus';

export class SocketService {
    private io: Server;
    private firebaseService: FirebaseService;

    constructor(server: any) {
        this.io = new Server(server, {
            cors: {
                origin: "*", // Configure this based on your needs
                methods: ["GET", "POST", "PUT"]
            }
        });
        this.firebaseService = new FirebaseService(this.io);
        this.setupSocketHandlers();
    }

    private handleError(socket: Socket, error: unknown, event: string) {
        console.error(`Error in ${event}:`, error);
        const errorMessage = error instanceof Error ? error.message : 'An unknown error occurred';
        const errorCode = error instanceof CustomError ? error.statusCode : Code.InternalServerError;
        
        socket.emit('error', {
            success: false,
            event,
            code: errorCode,
            message: errorMessage
        });
    }

    private setupSocketHandlers() {
        this.io.on('connection', (socket: Socket) => {
            console.log('Client connected:', socket.id);

            // Handle cart QR code scanning
            socket.on('scan-cart-qr', async (data: { cartQrCode: string, userId: string }) => {
                try {
                    if (!data.cartQrCode || !data.userId) {
                        throw new CustomError('Missing required fields', Code.BadRequest);
                    }

                    const { cartQrCode, userId } = data;
                    socket.join(userId);

                    await this.firebaseService.startCartScanning(cartQrCode, userId);

                    socket.emit('cart-connected', {
                        success: true,
                        cartQrCode,
                        message: 'Successfully connected to cart'
                    });
                } catch (error) {
                    this.handleError(socket, error, 'scan-cart-qr');
                }
            });

            // Handle stop cart scanning
            socket.on('stop-cart-scanning', async (data: { cartQrCode: string }) => {
                try {
                    if (!data.cartQrCode) {
                        throw new CustomError('Missing cart QR code', Code.BadRequest);
                    }

                    const { cartQrCode } = data;
                    await this.firebaseService.stopCartScanning(cartQrCode);
                    
                    socket.emit('scanning-stopped', {
                        success: true,
                        message: 'Cart scanning stopped successfully'
                    });
                } catch (error) {
                    this.handleError(socket, error, 'stop-cart-scanning');
                }
            });

            // Handle disconnection
            socket.on('disconnect', () => {
                try {
                    console.log('Client disconnected:', socket.id);
                    // Add any cleanup logic here if needed
                } catch (error) {
                    this.handleError(socket, error, 'disconnect');
                }
            });

            // Handle errors
            socket.on('error', (error: unknown) => {
                this.handleError(socket, error, 'socket-error');
            });
        });
    }

    public getIO(): Server {
        return this.io;
    }
} 