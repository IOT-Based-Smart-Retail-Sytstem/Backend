import { initializeApp } from 'firebase/app';
import { getDatabase, ref, onValue, set, DataSnapshot, get } from 'firebase/database';
import { Server } from 'socket.io';
import * as dotenv from 'dotenv';
import CartModel from '../../models/user/cart.model';
import { connectUserToCart, addToCart } from '../user/cart.service';
import { getProductByBarcode } from '../user/product.service';

dotenv.config();

console.log('\n=== Initializing Firebase ===');

const firebaseConfig = {
    databaseURL: "https://scanned-products-default-rtdb.firebaseio.com"
};

const app = initializeApp(firebaseConfig);
const database = getDatabase(app);


export class FirebaseService {
    private io: Server;

    constructor(io: Server) {
        console.log('FirebaseService initialized');
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

    private async printDatabaseState() {
        try {
            console.log('Fetching Firebase nodes...');
            const rootRef = ref(database, 'products');
            const snapshot = await get(rootRef);
            const products = snapshot.val();
            
            // Get the first product key (since it's a nested object)
            const productKey = Object.keys(products)[0];
            const productData = products[productKey];
            
            console.log('\n=== Firebase Product Data ===');
            console.log('Product Key:', productKey);
            console.log('Barcode:', productData.barcode);
            console.log('Count:', productData.count);
            console.log('==============================\n');
        } catch (error) {
            console.error('Error printing Firebase nodes:', error);
        }
    }

    public async startCartScanning(qrCode: string, userId: string) {
        try {
            // Update cart with userId
            const cart = await connectUserToCart(userId, qrCode);

            // Set scanning flag in Firebase
            await this.updateNode(`start_scanning`, true);

            // Listen to products node for barcode scans
            const productsRef = ref(database, 'products');
            onValue(productsRef, async (snapshot: DataSnapshot) => {
                const products = snapshot.val();
                if (!products) return;
                
                const productKey = Object.keys(products)[0];
                const scannedProduct = products[productKey];
                if (scannedProduct && scannedProduct.barcode) {
                    try {
                        // Find product in database by barcode
                        console.log(scannedProduct)
                        const product = await getProductByBarcode(scannedProduct.barcode);
                        const updatedCart = await addToCart(userId, product._id.toString(), scannedProduct.count || 1);
                        this.io.to(userId).emit('products-update', {
                            success: true,
                            cartId: cart._id,
                            product: {
                                ...product.toObject(),
                                quantity: scannedProduct.count || 1
                            },
                            cartProduts:{
                                updatedCart
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
                await cart.save();
            }

            // Update Firebase scanning flag
            await this.updateNode(`start_scanning`, false);
            return true;
        } catch (error) {
            console.error('Error stopping cart scanning:', error);
            throw error;
        }
    }
}