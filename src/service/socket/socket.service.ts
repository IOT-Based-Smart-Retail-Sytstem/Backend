import { Server, Socket } from 'socket.io';
import { CartFirebaseService } from '../firebase/cart.firebase.service';
import { ShelfFirebaseService } from '../firebase/shelf.firebase.service';
import { CustomError } from '../../utils/custom.error';
import { Code } from '../../utils/httpStatus';

export class SocketService {
    private io: Server;
    private cartFirebaseService: CartFirebaseService;
    private shelfFirebaseService: ShelfFirebaseService;

    constructor(server: any) {
        this.io = new Server(server, {
            cors: {
                origin: "*", // Configure this based on your needs
                methods: ["GET", "POST", "PUT"]
            }
        });
        
        // Initialize both Firebase services
        this.cartFirebaseService = new CartFirebaseService(this.io);
        this.shelfFirebaseService = new ShelfFirebaseService(this.io);
        
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

                    await this.cartFirebaseService.startCartScanning(cartQrCode, userId);

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
                    await this.cartFirebaseService.stopCartScanning(cartQrCode);
                    
                    socket.emit('scanning-stopped', {
                        success: true,
                        message: 'Cart scanning stopped successfully'
                    });
                } catch (error) {
                    this.handleError(socket, error, 'stop-cart-scanning');
                }
            });

            // Handle disconnection
            socket.on('disconnect', async () => {
                try {
                    console.log('Client disconnected:', socket.id);
                    // Note: You might want to track active carts per socket
                    // and stop scanning for that specific cart instead of using socket.id
                    // await this.cartFirebaseService.stopCartScanning(cartId);
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