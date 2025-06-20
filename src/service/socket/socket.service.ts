import { Server, Socket } from 'socket.io';
import { CartFirebaseService } from '../firebase/cart.firebase.service';
import { ShelfFirebaseService } from '../firebase/shelf.firebase.service';
import { CustomError } from '../../utils/custom.error';
import { Code } from '../../utils/httpStatus';
import { verifyJwt } from '../../utils/jwt';

export class SocketService {
    private io: Server;
    private cartFirebaseService: CartFirebaseService;
    private shelfFirebaseService: ShelfFirebaseService;
    private socketDataMap: Map<string, { cartQrCode: string, userId: string }> = new Map();

    constructor(server: any) {
        this.io = new Server(server, {
            cors: {
                origin: "*", // Configure this based on your needs
                methods: ["GET", "POST", "PUT"]
            }
        });
        
        // Add authentication middleware
        this.io.use(this.authenticateSocket);
        
        // Initialize both Firebase services
        this.cartFirebaseService = new CartFirebaseService(this.io);        
        this.setupSocketHandlers();
    }

    private authenticateSocket = async (socket: Socket, next: (err?: Error) => void) => {
        try {
            const token = socket.handshake.auth.token;
            if (!token) {
                throw new CustomError('Authentication token required', Code.Unauthorized);
            }

            // Use the verifyJwt utility
            const decoded = verifyJwt<{ _id: string }>(token, 'accessTokenPublicKey');
            if (!decoded || !decoded._id) {
                throw new CustomError('Invalid token', Code.Unauthorized);
            }

            // Attach the userId to the socket for later use
            socket.handshake.auth.userId = decoded._id;
            next();
        } catch (error) {
            next(error instanceof Error ? error : new Error('Authentication failed'));
        }
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

    private getUserIdFromSocket(socket: Socket): string {
        const userId = socket.handshake.auth.userId;
        if (!userId) {
            throw new CustomError('User not authenticated', Code.Unauthorized);
        }
        return userId;
    }

    private setupSocketHandlers() {
        this.io.on('connection', (socket: Socket) => {
            console.log('Client connected:', socket.id);

            // Handle cart QR code scanning
            socket.on('scan-cart-qr', async () => {
                try {
                    const socketData = this.socketDataMap.get(socket.id);
                    if (!socketData) {
                        throw new CustomError('No cart data found for this socket', Code.BadRequest);
                    }

                    const { cartQrCode } = socketData;
                    const userId = this.getUserIdFromSocket(socket);
                    socket.join(socket.id);
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
            socket.on('stop-cart-scanning', async () => {
                try {
                    const socketData = this.socketDataMap.get(socket.id);
                    if (!socketData) {
                        throw new CustomError('No cart data found for this socket', Code.BadRequest);
                    }
                    const { cartQrCode } = socketData;
                    await this.cartFirebaseService.clearCart(cartQrCode);
                    this.socketDataMap.delete(socket.id);
                    
                    socket.emit('scanning-stopped', {
                        success: true,
                        message: 'Cart scanning stopped successfully'
                    });
                } catch (error) {
                    this.handleError(socket, error, 'stop-cart-scanning');
                }
            });

            // Set cart data
            socket.on('set-cart-data', (data: { cartQrCode: string }) => {
                try {
                    if (!data.cartQrCode) {
                        throw new CustomError('Missing cart QR code', Code.BadRequest);
                    }
                    const userId = this.getUserIdFromSocket(socket);
                    this.socketDataMap.set(socket.id, { cartQrCode: data.cartQrCode, userId });
                    socket.emit('cart-data-set', {
                        success: true,
                        message: 'Cart data set successfully'
                    });
                } catch (error) {
                    this.handleError(socket, error, 'set-cart-data');
                }
            });

            // Handle disconnection
            socket.on('disconnect', async () => {
                try {
                    console.log('Client disconnected:', socket.id);
                    const socketData = this.socketDataMap.get(socket.id);
                    if (socketData) {
                        await this.cartFirebaseService.clearCart(socketData.cartQrCode);
                        this.socketDataMap.delete(socket.id);
                    }
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