import { Server, Socket } from 'socket.io';
import { FirebaseService } from '../firebase/firebase.service';

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

    private setupSocketHandlers() {
        this.io.on('connection', (socket: Socket) => {
            console.log('Client connected:', socket.id);

            // Handle cart QR code scanning
            socket.on('scan-cart-qr', async (data: { cartQrCode: string, userId: string }) => {
                console.log("scanning");
                console.log("data", data)
                try {
                    const { cartQrCode, userId } = data;
                    socket.join(userId); // Join user's room for targeted updates

                    // Start cart scanning
                    await this.firebaseService.startCartScanning(cartQrCode, userId);

                    // Notify mobile app of successful connection
                    socket.emit('cart-connected', {
                        success: true,
                        cartQrCode,
                        message: 'Successfully connected to cart'
                    });
                } catch (error) {
                    socket.emit('error', { 
                        success: false,
                        message: 'Failed to connect to cart',
                        error: error instanceof Error ? error.message : String(error)
                    });
                }
            });

            // Handle stop cart scanning
            socket.on('stop-cart-scanning', async (data: { cartQrCode: string }) => {
                try {
                    const { cartQrCode } = data;
                    await this.firebaseService.stopCartScanning(cartQrCode);
                    socket.emit('scanning-stopped', {
                        success: true,
                        message: 'Cart scanning stopped successfully'
                    });
                } catch (error) {
                    socket.emit('error', {
                        success: false,
                        message: 'Failed to stop cart scanning',
                        error: error instanceof Error ? error.message : String(error)
                    });
                }
            });

            // Handle disconnection
            socket.on('disconnect', () => {
                console.log('Client disconnected:', socket.id);
            });
        });
    }

    public getIO(): Server {
        return this.io;
    }
} 