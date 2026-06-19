import { messaging } from '@/lib/firebase-admin';
import dbConnect from '@/lib/db';
import User from '@/models/User';

interface FcmPayload {
    title: string;
    body: string;
    data?: Record<string, string>;
}

export async function sendPushToUser(userId: string, payload: FcmPayload) {
    if (!messaging) return;

    try {
        await dbConnect();
        const user = await User.findById(userId).select('deviceTokens notificationPreferences');
        if (!user) return;

        const prefs = user.notificationPreferences || {};
        const tokens: string[] = user.deviceTokens || [];

        if (tokens.length === 0) return;

        // Determine notification type from payload data
        const type = payload.data?.type || 'system';

        // Check user preferences
        if (type === 'new_message' && prefs.pushMessages === false) return;
        if ((type === 'ad_update' || type === 'ad_approved' || type === 'ad_sold') && prefs.pushAds === false) return;

        const message = {
            tokens,
            notification: {
                title: payload.title,
                body: payload.body,
            },
            data: payload.data || {},
            android: {
                priority: 'high' as const,
                notification: {
                    channelId: type === 'new_message' ? 'messages_channel' : 'notifications_channel',
                    sound: 'default',
                },
            },
            apns: {
                payload: {
                    aps: {
                        sound: 'default',
                        badge: 1,
                    },
                },
            },
        };

        const response = await messaging.sendEachForMulticast(message);

        // Clean up invalid tokens
        if (response.failureCount > 0) {
            const invalidTokens: string[] = [];
            response.responses.forEach((resp, idx) => {
                if (!resp.success && resp.error?.code === 'messaging/invalid-registration-token' ||
                    resp.error?.code === 'messaging/registration-token-not-registered') {
                    invalidTokens.push(tokens[idx]);
                }
            });

            if (invalidTokens.length > 0) {
                await User.findByIdAndUpdate(userId, {
                    $pull: { deviceTokens: { $in: invalidTokens } },
                });
            }
        }
    } catch (error) {
        console.error('[FCM] Error sending push:', error);
    }
}
