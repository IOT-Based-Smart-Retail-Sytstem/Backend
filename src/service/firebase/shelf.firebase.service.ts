import { initializeApp } from 'firebase/app';
import { getDatabase, ref, onValue, DataSnapshot } from 'firebase/database';
import { Server } from 'socket.io';
import * as dotenv from 'dotenv';
import { getProductByBarcode, updateProductState } from '../user/product.service';

dotenv.config();

console.log('\n=== Initializing Firebase (Shelf) ===');

const shelfFirebaseConfig = {
    databaseURL: "https://test-a06c1-default-rtdb.firebaseio.com"
};

const shelfApp = initializeApp(shelfFirebaseConfig, 'shelf');
const shelfDatabase = getDatabase(shelfApp);

export class ShelfFirebaseService {
    private io: Server;
    private readonly SHELF_BARCODE = '62220335232438';

    constructor(io: Server) {
        console.log('ShelfFirebaseService initialized');
        this.io = io;
        this.startShelfStateMonitoring();
    }

    private async startShelfStateMonitoring() {
        try {
            console.log('Starting shelf state monitoring...');
            const shelfRef = ref(shelfDatabase, 'shelf');
            
            onValue(shelfRef, async (snapshot: DataSnapshot) => {
                const shelfData = snapshot.val();
                if (!shelfData) return;

                try {
                    // Get product by barcode
                    const product = await getProductByBarcode(this.SHELF_BARCODE);
                    if (!product) {
                        console.error('Product not found with barcode:', this.SHELF_BARCODE);
                        return;
                    }

                    // Update product state
                    const updatedProduct = await updateProductState(product._id.toString(), shelfData.state);

                    // Emit the update to all connected clients
                    this.io.emit('shelf-state-update', {
                        success: true,
                        product: {
                            ...updatedProduct.toObject(),
                            shelfState: shelfData.state,
                            weight: shelfData.weight
                        }
                    });

                    console.log('Shelf state updated:', {
                        barcode: this.SHELF_BARCODE,
                        state: shelfData.state,
                        weight: shelfData.weight
                    });
                } catch (error) {
                    console.error('Error processing shelf state update:', error);
                    this.io.emit('error', {
                        success: false,
                        message: 'Failed to process shelf state update',
                        error: error instanceof Error ? error.message : String(error)
                    });
                }
            });

            console.log('Shelf state monitoring started successfully');
        } catch (error) {
            console.error('Error starting shelf state monitoring:', error);
            throw error;
        }
    }

    public getShelfBarcode(): string {
        return this.SHELF_BARCODE;
    }
}