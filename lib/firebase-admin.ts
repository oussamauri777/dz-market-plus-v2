import { initializeApp, cert, getApps } from 'firebase-admin/app';
import { getMessaging, Messaging } from 'firebase-admin/messaging';

let messagingInstance: Messaging | null = null;

function initFirebaseAdmin() {
    if (getApps().length > 0) return;

    const projectId = process.env.FIREBASE_PROJECT_ID;
    const clientEmail = process.env.FIREBASE_CLIENT_EMAIL;
    const privateKey = process.env.FIREBASE_PRIVATE_KEY?.replace(/\\n/g, '\n');

    if (projectId && clientEmail && privateKey) {
        initializeApp({
            credential: cert({ projectId, clientEmail, privateKey }),
        });
        messagingInstance = getMessaging();
    } else {
        const serviceAccountJson = process.env.FIREBASE_SERVICE_ACCOUNT_JSON;
        if (serviceAccountJson) {
            try {
                const serviceAccount = JSON.parse(serviceAccountJson);
                initializeApp({ credential: cert(serviceAccount) });
                messagingInstance = getMessaging();
            } catch {
                console.warn('[FIREBASE] Invalid FIREBASE_SERVICE_ACCOUNT_JSON');
            }
        } else {
            console.warn('[FIREBASE] No Firebase credentials found – FCM disabled');
        }
    }
}

initFirebaseAdmin();

export { messagingInstance as messaging };
