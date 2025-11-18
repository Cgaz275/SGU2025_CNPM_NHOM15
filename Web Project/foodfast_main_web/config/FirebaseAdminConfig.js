import admin from 'firebase-admin';

let adminApp;

try {
    if (!admin.apps.length) {
        const serviceAccountKey = {
            projectId: process.env.FIREBASE_PROJECT_ID,
            privateKey: process.env.FIREBASE_PRIVATE_KEY
                ? process.env.FIREBASE_PRIVATE_KEY.replace(/\\n/g, '\n')
                : undefined,
        };

        // clientEmail is optional for notifications
        if (process.env.FIREBASE_CLIENT_EMAIL) {
            serviceAccountKey.clientEmail = process.env.FIREBASE_CLIENT_EMAIL;
        }

        if (!serviceAccountKey.projectId || !serviceAccountKey.privateKey) {
            throw new Error('Missing Firebase Admin SDK environment variables. Required: FIREBASE_PROJECT_ID, FIREBASE_PRIVATE_KEY');
        }

        adminApp = admin.initializeApp({
            credential: admin.credential.cert(serviceAccountKey),
        });
    } else {
        adminApp = admin.app();
    }
} catch (error) {
    console.error('Failed to initialize Firebase Admin SDK:', error);
    throw error;
}

export const db = admin.firestore();
export default adminApp;
