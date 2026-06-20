import { NextResponse } from "next/server";
import dbConnect from "@/lib/db";
import User from "@/models/User";
import crypto from "crypto";
import { sendPasswordResetEmail } from "@/lib/email";
import fs from 'fs';
import path from 'path';

function logDebug(message: string, data?: any) {
    const logPath = path.join(process.cwd(), 'debug.log');
    const timestamp = new Date().toISOString();
    const logMessage = `[${timestamp}] [FORGOT_PASSWORD] ${message} ${data ? JSON.stringify(data) : ''}\n`;
    try {
        fs.appendFileSync(logPath, logMessage);
    } catch (e) {
        console.error("Failed to write to debug log", e);
    }
}

export async function POST(req: Request) {
    try {
        const { email } = await req.json();

        if (!email) {
            return NextResponse.json({ error: "Email is required" }, { status: 400 });
        }

        await dbConnect();

        const user = await User.findOne({ email });

        if (!user) {
            logDebug("User not found for email:", email);
            return NextResponse.json({ message: "If an account with that email exists, we have sent a password reset link." });
        }

        // Generate reset token
        const resetToken = crypto.randomBytes(32).toString("hex");
        const passwordResetToken = crypto
            .createHash("sha256")
            .update(resetToken)
            .digest("hex");

        // Token expires in 1 hour
        const passwordResetExpires = new Date(Date.now() + 3600000);

        logDebug("Generating token for:", email);
        logDebug("Raw token:", resetToken);
        logDebug("Hashed token:", passwordResetToken);
        logDebug("Expires at:", passwordResetExpires);

        // Use native collection update to bypass Mongoose schema strict mode
        const updateResult = await User.collection.updateOne(
            { _id: user._id },
            {
                $set: {
                    resetPasswordToken: passwordResetToken,
                    resetPasswordExpires: passwordResetExpires
                }
            }
        );
        logDebug("Update result:", updateResult);

        // Create reset URL
        const appUrl = process.env.NEXT_PUBLIC_APP_URL 
            || (process.env.VERCEL_PROJECT_PRODUCTION_URL 
                ? `https://${process.env.VERCEL_PROJECT_PRODUCTION_URL}` 
                : 'https://dz-market-plus-v2.vercel.app');
        const resetUrl = `${appUrl}/reset-password?token=${resetToken}`;

        try {
            await sendPasswordResetEmail(user.email, resetUrl);
            return NextResponse.json({ message: "If an account with that email exists, we have sent a password reset link." });
        } catch (error) {
            logDebug("Error sending email:", error);
            await User.collection.updateOne(
                { _id: user._id },
                {
                    $unset: {
                        resetPasswordToken: 1,
                        resetPasswordExpires: 1
                    }
                }
            );
            return NextResponse.json({ error: "There was an error sending the email. Please try again later." }, { status: 500 });
        }
    } catch (error: any) {
        logDebug("Critical error:", error);
        return NextResponse.json({ error: `Internal Server Error: ${error.message}` }, { status: 500 });
    }
}
