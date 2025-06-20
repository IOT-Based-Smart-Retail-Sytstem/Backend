// shelf.socket.service.ts
import { Server, Socket } from 'socket.io';
import { shelfEventEmitter } from '../firebase/shelf.firebase.service';
import { getProductByBarcode, updateProductState } from '../user/product.service';
import { CustomError } from '../../utils/custom.error';
import { Code } from '../../utils/httpStatus';

export class ShelfSocketService {
    private io: Server;
    private readonly SHELF_BARCODE = '62220335232438';

    constructor(server: any) {
        this.io = new Server(server, {
            cors: {
                origin: '*',
                methods: ['GET', 'POST']
            }
        });

        this.listenToFirebaseEvents();
        this.setupSocketHandlers();
    }

    private setupSocketHandlers() {
        this.io.on('connection', (socket: Socket) => {
            console.log('Shelf client connected:', socket.id);

            socket.on('disconnect', () => {
                console.log('Shelf client disconnected:', socket.id);
            });

            socket.on('error', (error: unknown) => {
                this.handleError(socket, error, 'socket-error');
            });
        });
    }

    private listenToFirebaseEvents() {
        shelfEventEmitter.on('shelfDataUpdated', async (shelfData) => {
            try {
                const product = await getProductByBarcode(this.SHELF_BARCODE);
                if (!product) {
                    console.error('Product not found for shelf barcode:', this.SHELF_BARCODE);
                    return;
                }

                const updatedProduct = await updateProductState(product._id.toString(), shelfData.state);

                this.io.emit('shelf-state-update', {
                    success: true,
                    product: {
                        ...updatedProduct.toObject(),
                        shelfState: shelfData.state,
                        weight: shelfData.weight
                    }
                });

                console.log('shelf update sent via socket:', shelfData);
            } catch (error) {
                console.error('Error sending shelf update:', error);
                this.io.emit('error', {
                    success: false,
                    message: 'Failed to emit shelf update',
                    error: error instanceof Error ? error.message : String(error)
                });
            }
        });
    }

    private handleError(socket: Socket, error: unknown, event: string) {
        const errorMessage = error instanceof Error ? error.message : 'Unknown error';
        const errorCode = error instanceof CustomError ? error.statusCode : Code.InternalServerError;

        socket.emit('error', {
            success: false,
            event,
            code: errorCode,
            message: errorMessage
        });
    }

    public getIO(): Server {
        return this.io;
    }
}
