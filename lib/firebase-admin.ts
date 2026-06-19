import admin from 'firebase-admin';

function initFirebaseAdmin() {
    if (admin.apps.length > 0) return admin;

    const projectId = process.env.FIREBASE_PROJECT_ID;
    const clientEmail = process.env.FIREBASE_CLIENT_EMAIL;
    const privateKey = process.env.FIREBASE_PRIVATE_KEY?.replace(/\\n/g, '\n');

    if (projectId && clientEmail && privateKey) {
        admin.initializeApp({
            credential: admin.credential.cert({
                projectId,
                clientEmail,
                privateKey,
            }),
        });
    } else {
        const serviceAccountJson = process.env.FIREBASE_SERVICE_ACCOUNT_JSON;
        if (serviceAccountJson) {
            const serviceAccount = JSON.parse(serviceAccountJson);
            admin.initializeApp({
                credential: admin.credential.cert(serviceAccount),
            });
        } else {
            console.warn('[FIREBASE] No Firebase credentials found – FCM disabled');
        }
    }

    return admin;
}

export const firebaseAdmin = initFirebaseAdmin();
export const messaging = firebaseAdmin.apps.length > 0 ? firebaseAdmin.messaging() : null;
