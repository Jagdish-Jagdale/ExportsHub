/**
 * Cleanup script — removes replies that don't match ExportsHub subject filter
 */
require('dotenv').config();
const admin = require('firebase-admin');
const path = require('path');

const serviceAccountPath = path.resolve(process.env.FIREBASE_SERVICE_ACCOUNT_PATH || './serviceAccountKey.json');
admin.initializeApp({ credential: admin.credential.cert(require(serviceAccountPath)) });
const db = admin.firestore();

const SUBJECT_FILTER = 'exportshub';

(async () => {
    console.log('🧹 Clearing all replies from Firestore...\n');
    const snap = await db.collection('replies').get();
    let deleted = 0;

    const batch = db.batch();
    snap.forEach(doc => {
        batch.delete(doc.ref);
        deleted++;
    });

    await batch.commit();
    console.log(`✅ Done — deleted ${deleted} emails`);
    process.exit(0);
})();
