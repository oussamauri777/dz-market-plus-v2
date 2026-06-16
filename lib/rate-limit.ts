import dbConnect from "./db";
import mongoose from "mongoose";

interface RateLimitRecord {
    _id?: string;
    identifier: string;
    attempts: number;
    resetAt: Date;
}

// Simple in-memory collection helper since we're using native MongoDB driver
async function getRateLimitCollection() {
    await dbConnect();
    const db = mongoose.connection.db;
    if (!db) throw new Error("Database connection not established");
    return db.collection('ratelimits');
}

interface RateLimitOptions {
    windowMs?: number;  // Time window in milliseconds
    maxAttempts?: number;  // Max attempts per window
}

export async function rateLimit(
    identifier: string,
    options: RateLimitOptions = {}
): Promise<{ success: boolean; remaining?: number; resetAt?: Date }> {
    const {
        windowMs = 15 * 60 * 1000, // 15 minutes default
        maxAttempts = 5 // 5 attempts default
    } = options;

    try {
        const collection = await getRateLimitCollection();
        const now = new Date();

        // Find existing record
        const record = await collection.findOne<RateLimitRecord>({ identifier });

        if (!record) {
            // Create new record
            await collection.insertOne({
                identifier,
                attempts: 1,
                resetAt: new Date(now.getTime() + windowMs)
            });
            return { success: true, remaining: maxAttempts - 1 };
        }

        // Check if window has expired
        if (now > record.resetAt) {
            // Reset the record
            await collection.updateOne(
                { identifier },
                {
                    $set: {
                        attempts: 1,
                        resetAt: new Date(now.getTime() + windowMs)
                    }
                }
            );
            return { success: true, remaining: maxAttempts - 1 };
        }

        // Check if limit exceeded
        if (record.attempts >= maxAttempts) {
            return {
                success: false,
                remaining: 0,
                resetAt: record.resetAt
            };
        }

        // Increment attempts
        await collection.updateOne(
            { identifier },
            { $inc: { attempts: 1 } }
        );

        return {
            success: true,
            remaining: maxAttempts - (record.attempts + 1),
            resetAt: record.resetAt
        };
    } catch (error) {
        console.error("[RATE_LIMIT_ERROR]", error);
        // On error, allow the request to proceed
        return { success: true };
    }
}

// Helper to get IP address from request
export function getClientIdentifier(req: Request): string {
    // Try to get real IP from headers (for proxies)
    const forwarded = req.headers.get('x-forwarded-for');
    if (forwarded) {
        return forwarded.split(',')[0].trim();
    }

    const realIp = req.headers.get('x-real-ip');
    if (realIp) {
        return realIp;
    }

    // Fallback to a default identifier
    return 'unknown';
}
