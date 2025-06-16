import { initializeApp } from 'firebase/app';
import { getDatabase, ref, onValue, set, DataSnapshot, get, remove } from 'firebase/database';
import { Server } from 'socket.io';
import * as dotenv from 'dotenv';
import CartModel from '../../models/user/cart.model';
import { connectUserToCart, getUserCart, updateCart } from '../user/cart.service';
import { getProductByBarcode, updateProductState } from '../user/product.service';

dotenv.config();

console.log('\n=== Initializing Firebase ===');

const firebaseConfig = {
    databaseURL: "https://scanned-products-default-rtdb.firebaseio.com"
};

const shelfFirebaseConfig = {
    databaseURL: "https://test-a06c1-default-rtdb.firebaseio.com"
};

const app = initializeApp(firebaseConfig);
const shelfApp = initializeApp(shelfFirebaseConfig, 'shelf');
const database = getDatabase(app);
const shelfDatabase = getDatabase(shelfApp);

export class FirebaseService {
    private io: Server;
    private readonly SHELF_BARCODE = '62220335232438';

    constructor(io: Server) {
        console.log('FirebaseService initialized');
        this.io = io;
        this.printDatabaseState();
        this.startShelfStateMonitoring();
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
            console.log('Barcode:', products.barcode);
            console.log('Count:', products.count);
            console.log('==============================\n');
        } catch (error) {
            console.error('Error printing Firebase nodes:', error);
        }
    }

    public async startCartScanning(cartQrCode: string, userId: string) {
        try {
            // Update cart with userId
            const cart = await connectUserToCart(userId, cartQrCode);
            console.log("cart", cart)

            // Set scanning flag in Firebase
            await this.updateNode(`start_scanning`, true);

            // Listen to products node for barcode scans
            const productsRef = ref(database, 'products');
            onValue(productsRef, async (snapshot: DataSnapshot) => {
                const products = snapshot.val();
                if (!products) return;
                if (products && products.barcode) {
                    try {
                        // Find product in database by barcode
                        console.log(products)
                        const product = await getProductByBarcode(products.barcode);
                        const cart = await getUserCart(userId);
                        console.log("cart in startCartScanning", cart)
                        const updatedCart = await updateCart(userId, product._id.toString(), products.count || 1);
                        console.log("updatedCart in startCartScanning", updatedCart)
                        this.io.to(userId).emit('products-update', {
                            success: true,
                            cartQrCode: cart._id,
                            product: {
                                ...product.toObject(),
                                quantity: updatedCart.items.find(item => item.product._id.toString() === product._id.toString())?.quantity || 0
                            }
                        });
                    } catch (error) {
                        console.error('Error processing scanned product:', error);
                        this.io.to(userId).emit('error', {
                            success: false,
                            message: 'Failed to process scanned product',
                            error: error instanceof Error ? error.message : String(error)
                        });
                    }
                }
            });

            return true;
        } catch (error) {
            console.error('Error starting cart scanning:', error);
            throw error;
        }
    }

    public async stopCartScanning(cartId: string) {
        try {
            // Update cart in database
            const cart = await CartModel.findById(cartId);
            if (cart) {
                cart.isActive = false;
                cart.items = [];
                cart.totalPrice = 0;
                cart.user = null;
                await cart.save();
            }

            // Update Firebase scanning flag
            await this.deleteNode(`products`);
            await this.updateNode(`start_scanning`, false);
            return true;
        } catch (error) {
            console.error('Error stopping cart scanning:', error);
            throw error;
        }
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
}