// shelf.socket.service.ts
import { Socket, Namespace } from 'socket.io';
import { shelfEventEmitter, ShelfFirebaseService } from '../firebase/shelf.firebase.service';
import { getProductByBarcode, updateProductState, getProductStateCounts } from '../product.service';
import { CustomError } from '../../utils/custom.error';
import { Code } from '../../utils/httpStatus';

export class ShelfSocketService {
    private io: Namespace;
    private readonly SHELF_BARCODE = '62220335232438';
    private shelfFirebaseService: ShelfFirebaseService;
    constructor(io: Namespace) {
        this.io = io;
        this.shelfFirebaseService = new ShelfFirebaseService();
        this.listenToFirebaseEvents();
        this.setupSocketHandlers();
    }

    private setupSocketHandlers() {
        this.io.on('connection', async (socket: Socket) => {
            console.log('Shelf client connected:', socket.id);

            // Emit product-states-update immediately on connection
            try {
                const stateCounts = await getProductStateCounts();
                socket.emit('product-states-update', {
                    success: true,
                    stateCounts: stateCounts
                });
            } catch (error) {
                this.handleError(socket, error, 'product-states-update');
            }

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
                
                // Get updated product state counts
                const stateCounts = await getProductStateCounts();

                // Send shelf state update event
                this.io.emit('shelf-state-update', {
                    success: true,
                    product: {
                        ...updatedProduct.toObject(),
                        shelfState: shelfData.state,
                        weight: shelfData.weight
                    }
                });

                // Send separate state counts event
                this.io.emit('product-states-update', {
                    success: true,
                    stateCounts: stateCounts
                });

                console.log('shelf update sent via socket:', shelfData);
                console.log('Updated product state counts:', stateCounts);
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

    public getIO(): Namespace {
        return this.io;
    }
}
