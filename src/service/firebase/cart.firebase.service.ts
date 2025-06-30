import { initializeApp } from 'firebase/app';
import { getDatabase, ref, onValue, set, DataSnapshot, get, remove, off } from 'firebase/database';
import { Namespace } from 'socket.io';
import * as dotenv from 'dotenv';
import { connectUserToCart, getUserCart, updateCart, getCartByQrCode } from '../cart.service';
import { getProductByBarcode, getProductStateCounts } from '../product.service';

dotenv.config();

console.log('\n=== Initializing Firebase (Cart) ===');

const firebaseConfig = {
    databaseURL: "https://scanned-products-default-rtdb.firebaseio.com"
};

const app = initializeApp(firebaseConfig);
const database = getDatabase(app);

export class CartFirebaseService {
    private io: Namespace;
    private lastEventKey: string | null = null;
    
    // Store the current listener reference to properly clean it up
    private currentListener: (() => void) | null = null;
    private currentUserId: string | null = null;

    constructor(io: Namespace) {
        console.log('CartFirebaseService initialized');
        this.io = io;
        this.printDatabaseState();
    }

    private async updateNode(nodePath: string, value: any) {
        try {
            const nodeRef = ref(database, nodePath);
            await set(nodeRef, value);
            return true;
        } catch (error) {
            console.error('Error updating Firebase node:', error);
            throw error;
        }
    }

    private async deleteNode(nodePath: string) {
        try {
            const nodeRef = ref(database, nodePath);
            await remove(nodeRef);
        } catch (error) {
            console.error('Error deleting Firebase node:', error);
            throw error;
        }
    }

    private async printDatabaseState() {
        try {
            console.log('Fetching Firebase nodes...');
            const rootRef = ref(database, 'products');
            const snapshot = await get(rootRef);
            const products = snapshot.val();
            console.log('\n=== Firebase Product Data ===');
            console.log('Barcode:', products?.barcode);
            console.log('Count:', products?.count);
            console.log('==============================\n');
        } catch (error) {
            console.error('Error printing Firebase nodes:', error);
        }
    }

    // Clean up existing listener before creating a new one
    private cleanupListener() {
        if (this.currentListener) {
            console.log('Cleaning up existing Firebase listener');
            this.currentListener(); // This calls the unsubscribe function
            this.currentListener = null;
        }
    }

    public async startCartScanning(cartQrCode: string, userId: string) {
        try {
            // Clean up any existing listener first
            this.cleanupListener();

            // Connect user to cart
            const cart = await connectUserToCart(userId, cartQrCode);
            console.log("cart", cart);

            // Store current user ID
            this.currentUserId = userId;

            // Set scanning flag in Firebase
            await this.updateNode(`start_scanning`, true);

            const productsRef = ref(database, 'products');

            // Create the listener and store the unsubscribe function
            this.currentListener = onValue(productsRef, async (snapshot: DataSnapshot) => {
                const products = snapshot.val();
                if (!products || !products.barcode || !products.timestamp) return;

                // Create a unique key for this event
                const eventKey = `${products.barcode}_${products.timestamp}`;

                // Avoid duplicate events
                if (this.lastEventKey === eventKey) {
                    console.log('Duplicate scan ignored (same barcode & timestamp).');
                    return;
                }

                this.lastEventKey = eventKey; // mark as processed

                try {
                    console.log('Processing product:', products);
                    const product = await getProductByBarcode(products.barcode);
                    const cart = await getUserCart(userId);
                    console.log("cart in startCartScanning", cart);

                    const updatedCart = await updateCart(userId, product, products.count || 1);
                    console.log("updatedCart in startCartScanning", updatedCart);

                    // Get current product state counts (without updating stock)
                    const stateCounts = await getProductStateCounts();

                    // Send products update event
                    this.io.to(userId).emit('products-update', {
                        success: true,
                        cartQrCode: cart._id,
                        product: {
                            ...product.toObject(),
                            quantity: updatedCart.items.find(item =>
                                item.product._id.toString() === product._id.toString()
                            )?.quantity || 0
                        }
                    });

                    // Send separate state counts event
                    this.io.to(userId).emit('product-states-update', {
                        success: true,
                        stateCounts: stateCounts
                    });
                } catch (error) {
                    console.error('Error processing scanned product:', error);
                    this.io.to(userId).emit('error', {
                        success: false,
                        message: 'Failed to process scanned product',
                        error: error instanceof Error ? error.message : String(error)
                    });
                }
            });

            console.log(`Cart scanning started for user ${userId} with cart ${cartQrCode}`);
            return true;
        } catch (error) {
            console.error('Error starting cart scanning:', error);
            throw error;
        }
    }

    public async stopCartScanning() {
        try {
            console.log('Stopping cart scanning...');
            
            // Clean up the listener
            this.cleanupListener();
            
            // Reset state
            this.lastEventKey = null;
            this.currentUserId = null;
            
            // Update Firebase
            await this.updateNode(`start_scanning`, false);
            
            return true;
        } catch (error) {
            console.error('Error stopping cart scanning:', error);
            throw error;
        }
    }

    public async clearCart(cartQrCode: string) {
        try {
            const cart = await getCartByQrCode(cartQrCode);
            console.log("cart in clearCart", cart);
            if (cart) {
                cart.isActive = false;
                cart.items = [];
                cart.totalPrice = 0;
                cart.user = null;
                await cart.save();
            }

            // Stop scanning and clean up
            await this.stopCartScanning();
            
            // Clear Firebase nodes
            await this.deleteNode(`products`);

            return true;
        } catch (error) {
            console.error('Error clearing cart:', error);
            throw error;
        }
    }

    // Method to check if scanning is active
    public isScanning(): boolean {
        return this.currentListener !== null;
    }

    // Get current user ID if scanning
    public getCurrentUserId(): string | null {
        return this.currentUserId;
    }
}