// shelf.firebase.service.ts
import { initializeApp } from 'firebase/app';
import { getDatabase, ref, onValue, DataSnapshot } from 'firebase/database';
import { EventEmitter } from 'events';
import * as dotenv from 'dotenv';

dotenv.config();

console.log('\n=== Initializing Firebase (Shelf) ===');

const shelfFirebaseConfig = {
    databaseURL: process.env.SHELF_DATABASE_URL || 'https://test-a06c1-default-rtdb.firebaseio.com'
};

const shelfApp = initializeApp(shelfFirebaseConfig, 'shelf');
const shelfDatabase = getDatabase(shelfApp);

// نعرف إيفينت إيميتر علشان نبعث البيانات بعد ما تتحدث
export const shelfEventEmitter = new EventEmitter();

export class ShelfFirebaseService {
    constructor() {
        console.log('ShelfFirebaseService initialized');
        this.startShelfStateMonitoring();
    }

    private startShelfStateMonitoring() {
        try {
            console.log('Starting shelf state monitoring...');
            const shelfRef = ref(shelfDatabase, 'shelf');

            onValue(shelfRef, (snapshot: DataSnapshot) => {
                const shelfData = snapshot.val();
                if (!shelfData) return;

                console.log('New shelf data:', shelfData);

                // Emit new shelf data to whoever is listening
                shelfEventEmitter.emit('shelfDataUpdated', shelfData);
            });

            console.log('Shelf monitoring started.');
        } catch (error) {
            console.error('Error starting shelf monitoring:', error);
        }
    }
}