import { NextResponse } from "next/server";
import { sendVerificationEmail } from "@/lib/email";

export async function POST(req: Request) {
    try {
        const { email } = await req.json();

        if (!email) {
            return NextResponse.json({ error: "Email required" }, { status: 400 });
        }

        // Generate a random 6-digit code
        const code = Math.floor(100000 + Math.random() * 900000).toString();
        const expires = new Date(Date.now() + 10 * 60 * 1000); // 10 minutes

        // Store code in global map (for dev/simple deployment)
        // NOTE: Consider moving to Redis or DB for production serverless environments
        // @ts-ignore
        if (!global.emailCodes) {
            // @ts-ignore
            global.emailCodes = new Map();
        }
        // @ts-ignore
        global.emailCodes.set(email, { code, expires });

        // Send email via Resend
        try {
            await sendVerificationEmail(email, code);
            console.log(`[EMAIL] Verification code sent to ${email}`);
        } catch (emailError: any) {
            console.error('[EMAIL] Resend error:', emailError.message);
            // In development, log the code for testing
            if (process.env.NODE_ENV === 'development') {
                console.log("------------------------------------------------");
                console.log(`[EMAIL FALLBACK] Verification code for ${email}: ${code}`);
                console.log("------------------------------------------------");
            }
            // Return error to client
            return NextResponse.json({
                error: "Failed to send email. Please check your email configuration.",
                details: emailError.message
            }, { status: 500 });
        }

        return NextResponse.json({ success: true, message: "Code sent to your email" });
    } catch (error: any) {
        console.error("[EMAIL_SEND]", error);
        return NextResponse.json({ error: "Internal Error" }, { status: 500 });
    }
}
