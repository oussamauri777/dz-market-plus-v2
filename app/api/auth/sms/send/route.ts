import { NextResponse } from "next/server";
import dbConnect from "@/lib/db";
import User from "@/models/User";
import { sendSMS } from "@/lib/twilio";

export async function POST(req: Request) {
    try {
        const { phone } = await req.json();

        if (!phone) {
            return NextResponse.json({ error: "Phone number required" }, { status: 400 });
        }

        // Generate a random 6-digit code
        const code = Math.floor(100000 + Math.random() * 900000).toString();
        const expires = new Date(Date.now() + 10 * 60 * 1000); // 10 minutes

        // Store code in global map (for dev/simple deployment)
        // NOTE: Consider moving to Redis or DB for production serverless environments
        // @ts-ignore
        if (!global.smsCodes) {
            // @ts-ignore
            global.smsCodes = new Map();
        }
        // @ts-ignore
        global.smsCodes.set(phone, { code, expires });

        // Send SMS via Twilio
        try {
            await sendSMS(
                phone,
                `Your DZ Market+ verification code is: ${code}. Valid for 10 minutes.`
            );
            console.log(`[SMS] Verification code sent to ${phone}`);
        } catch (twilioError: any) {
            console.error('[SMS] Twilio error:', twilioError.message);
            // In development, log the code for testing
            if (process.env.NODE_ENV === 'development') {
                console.log("------------------------------------------------");
                console.log(`[SMS FALLBACK] Verification code for ${phone}: ${code}`);
                console.log("------------------------------------------------");
            }
            // Return error to client
            return NextResponse.json({
                error: "Failed to send SMS. Please check your Twilio configuration.",
                details: twilioError.message
            }, { status: 500 });
        }

        return NextResponse.json({ success: true, message: "Code sent" });
    } catch (error: any) {
        console.error("[SMS_SEND]", error);
        return NextResponse.json({ error: "Internal Error" }, { status: 500 });
    }
}
