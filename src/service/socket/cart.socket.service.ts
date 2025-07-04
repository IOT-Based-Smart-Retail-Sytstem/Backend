import { Socket, Namespace } from 'socket.io';
import { CartFirebaseService } from '../firebase/cart.firebase.service';
import { CustomError } from '../../utils/custom.error';
import { Code } from '../../utils/httpStatus';
import { verifyJwt } from '../../utils/jwt';

export class SocketService {
    private io: Namespace;
    private cartFirebaseService: CartFirebaseService;
    private socketDataMap: Map<string, { cartQrCode: string, userId: string, isScanning: boolean }> = new Map();

    constructor(io: Namespace) {
        this.io = io;
        
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

    private async cleanupSocketScanning(socketId: string) {
        try {
            const socketData = this.socketDataMap.get(socketId);
            if (socketData && socketData.isScanning) {
                console.log(`Cleaning up scanning for socket ${socketId}`);
                
                // Stop the Firebase listener (don't clear cart data)
                await this.cartFirebaseService.stopCartScanning();
                
                // Update scanning status
                socketData.isScanning = false;
                this.socketDataMap.set(socketId, socketData);
            }
        } catch (error) {
            console.error('Error cleaning up socket scanning:', error);
        }
    }

    private setupSocketHandlers() {
        this.io.on('connection', (socket: Socket) => {
            console.log('Client connected:', socket.id);

            // Handle cart QR code scanning
            socket.on('scan-cart-qr', async () => {
                try {
                    const socketData = this.socketDataMap.get(socket.id);
                    if (!socketData) {
                        throw new CustomError('No cart data found for this socket. Please set cart data first.', Code.BadRequest);
                    }

                    // Check if already scanning
                    if (socketData.isScanning) {
                        console.log('Already scanning for this socket, stopping previous scan first');
                        await this.cleanupSocketScanning(socket.id);
                    }

                    const { cartQrCode } = socketData;
                    const userId = this.getUserIdFromSocket(socket);
                    
                    // Join user-specific room for real-time updates
                    socket.join(userId);
                    
                    // Start scanning
                    await this.cartFirebaseService.startCartScanning(cartQrCode, userId);
                    
                    // Update scanning status
                    socketData.isScanning = true;
                    this.socketDataMap.set(socket.id, socketData);

                    socket.emit('cart-connected', {
                        success: true,
                        cartQrCode,
                        message: 'Successfully connected to cart and started scanning'
                    });
                    
                    console.log(`Started scanning for user ${userId} with cart ${cartQrCode}`);
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

                    if (!socketData.isScanning) {
                        socket.emit('scanning-stopped', {
                            success: true,
                            message: 'Cart scanning was not active'
                        });
                        return;
                    }

                    // Stop scanning but keep cart data
                    await this.cleanupSocketScanning(socket.id);

                    socket.emit('scanning-stopped', {
                        success: true,
                        message: 'Cart scanning stopped successfully'
                    });
                    
                    console.log(`Stopped scanning for socket ${socket.id}`);
                } catch (error) {
                    this.handleError(socket, error, 'stop-cart-scanning');
                }
            });

            // Clear cart and stop scanning
            socket.on('clear-cart', async () => {
                try {
                    const socketData = this.socketDataMap.get(socket.id);
                    if (!socketData) {
                        throw new CustomError('No cart data found for this socket', Code.BadRequest);
                    }

                    const { cartQrCode } = socketData;
                    
                    // Clear the cart (this will also stop scanning)
                    await this.cartFirebaseService.clearCart(cartQrCode);
                    
                    // Remove from socket data map
                    this.socketDataMap.delete(socket.id);
                    
                    socket.emit('cart-cleared', {
                        success: true,
                        message: 'Cart cleared successfully'
                    });
                    
                    console.log(`Cleared cart ${cartQrCode} for socket ${socket.id}`);
                } catch (error) {
                    this.handleError(socket, error, 'clear-cart');
                }
            });

            // Set cart data
            socket.on('set-cart-data', async (data: { cartQrCode: string }) => {
                try {
                    if (!data.cartQrCode) {
                        throw new CustomError('Missing cart QR code', Code.BadRequest);
                    }
                    
                    const userId = this.getUserIdFromSocket(socket);
                    
                    // If socket already has data and is scanning, stop it first
                    const existingData = this.socketDataMap.get(socket.id);
                    if (existingData && existingData.isScanning) {
                        console.log('Stopping existing scan before setting new cart data');
                        await this.cleanupSocketScanning(socket.id);
                    }
                    
                    // Set new cart data
                    this.socketDataMap.set(socket.id, { 
                        cartQrCode: data.cartQrCode, 
                        userId,
                        isScanning: false 
                    });
                    
                    socket.emit('cart-data-set', {
                        success: true,
                        cartQrCode: data.cartQrCode,
                        message: 'Cart data set successfully'
                    });
                    
                    console.log(`Set cart data for socket ${socket.id}: ${data.cartQrCode}`);
                } catch (error) {
                    this.handleError(socket, error, 'set-cart-data');
                }
            });

            // Handle disconnection
            socket.on('disconnect', async () => {
                try {
                    const socketData = this.socketDataMap.get(socket.id);
                    if (socketData) {
                        console.log('Client disconnected:', socket.id);
                        
                        // Clean up for this socket
                        await this.cartFirebaseService.clearCart(socketData.cartQrCode);
                        
                        // Remove from map
                        this.socketDataMap.delete(socket.id);

                        console.log(`Cleaned up socket ${socket.id}`);
                    }

                } catch (error) {
                    console.error('Error handling disconnect:', error);
                }
            });

            // Handle errors
            socket.on('error', (error: unknown) => {
                this.handleError(socket, error, 'socket-error');
            });
        });
    }

    public getIO(): Namespace {
        return this.io;
    }
}