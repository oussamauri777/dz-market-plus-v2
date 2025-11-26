import twilio from 'twilio';

const accountSid = process.env.TWILIO_ACCOUNT_SID;
const authToken = process.env.TWILIO_AUTH_TOKEN;
const twilioPhoneNumber = process.env.TWILIO_PHONE_NUMBER;

let twilioClient: ReturnType<typeof twilio> | null = null;

export function getTwilioClient() {
    if (!accountSid || !authToken) {
        throw new Error('Twilio credentials are not configured. Please set TWILIO_ACCOUNT_SID and TWILIO_AUTH_TOKEN in your environment variables.');
    }

    if (!twilioClient) {
        twilioClient = twilio(accountSid, authToken);
    }

    return twilioClient;
}

export async function sendSMS(to: string, body: string) {
    if (!twilioPhoneNumber) {
        throw new Error('Twilio phone number is not configured. Please set TWILIO_PHONE_NUMBER in your environment variables.');
    }

    const client = getTwilioClient();

    try {
        const message = await client.messages.create({
            body,
            from: twilioPhoneNumber,
            to,
        });

        console.log(`[TWILIO] SMS sent successfully. SID: ${message.sid}`);
        return message;
    } catch (error: any) {
        console.error('[TWILIO] Failed to send SMS:', error.message);
        throw new Error(`Failed to send SMS: ${error.message}`);
    }
}
