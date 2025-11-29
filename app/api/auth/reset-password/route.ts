import { NextResponse } from "next/server";
import dbConnect from "@/lib/db";
import User from "@/models/User";
import crypto from "crypto";
import bcrypt from "bcryptjs";
import fs from 'fs';
import path from 'path';

function logDebug(message: string, data?: any) {
    const logPath = path.join(process.cwd(), 'debug.log');
    const timestamp = new Date().toISOString();
    const logMessage = `[${timestamp}] [RESET_PASSWORD] ${message} ${data ? JSON.stringify(data) : ''}\n`;
    try {
        fs.appendFileSync(logPath, logMessage);
    } catch (e) {
        console.error("Failed to write to debug log", e);
    }
}

function validatePassword(password: string): string | null {
    const minLength = 8;
    const hasUpperCase = /[A-Z]/.test(password);
    const hasLowerCase = /[a-z]/.test(password);
    const hasNumber = /[0-9]/.test(password);

    if (password.length < minLength) return "Le mot de passe doit contenir au moins 8 caractères";
    if (!hasUpperCase) return "Le mot de passe doit contenir au moins une majuscule";
    if (!hasLowerCase) return "Le mot de passe doit contenir au moins une minuscule";
    if (!hasNumber) return "Le mot de passe doit contenir au moins un chiffre";
    return null;
}

export async function POST(req: Request) {
    try {
        const { token, password } = await req.json();

        if (!token || !password) {
            return NextResponse.json({ error: "Token and password are required" }, { status: 400 });
        }

        // Validate password strength
        const passwordError = validatePassword(password);
        if (passwordError) {
            return NextResponse.json({ error: passwordError }, { status: 400 });
        }

        await dbConnect();

        const passwordResetToken = crypto
            .createHash("sha256")
            .update(token)
            .digest("hex");

        logDebug("Received token:", token);
        logDebug("Hashed token:", passwordResetToken);
        logDebug("Checking for user with hash and expiry >", Date.now());

        // Use native collection findOne to bypass Mongoose schema
        const user = await User.collection.findOne({
            resetPasswordToken: passwordResetToken,
            resetPasswordExpires: { $gt: new Date() },
        });

        if (!user) {
            // Debug: Check if user exists with token but expired
            const expiredUser = await User.collection.findOne({ resetPasswordToken: passwordResetToken });
            if (expiredUser) {
                logDebug("Token found but expired. Expires at:", expiredUser.resetPasswordExpires);
            } else {
                logDebug("No user found with this token.");
            }
            return NextResponse.json({ error: "Invalid or expired token" }, { status: 400 });
        }

        logDebug("User found:", user.email);

        // Hash new password
        const hashedPassword = await bcrypt.hash(password, 12);

        // Use native collection update to bypass Mongoose schema
        await User.collection.updateOne(
            { _id: user._id },
            {
                $set: { password: hashedPassword },
                $unset: {
                    resetPasswordToken: 1,
                    resetPasswordExpires: 1
                }
            }
        );

        return NextResponse.json({ message: "Password reset successful" });
    } catch (error: any) {
        logDebug("Critical error:", error);
        return NextResponse.json({ error: "Internal Server Error" }, { status: 500 });
    }
}
