import { NextResponse } from "next/server";
import dbConnect from "@/lib/db";
import mongoose from "mongoose";

export async function GET() {
    try {
        await dbConnect();

        const collection = mongoose.connection.collection('reviews');

        // List indexes before
        const indexesBefore = await collection.indexes();
        console.log("Indexes before:", indexesBefore);

        const results = [];

        // Try to drop the problematic index
        try {
            if (indexesBefore.find((i: any) => i.name === 'reviewer_1_ad_1')) {
                await collection.dropIndex('reviewer_1_ad_1');
                results.push("Dropped index: reviewer_1_ad_1");
            } else {
                results.push("Index reviewer_1_ad_1 not found");
            }
        } catch (e: any) {
            results.push(`Failed to drop reviewer_1_ad_1: ${e.message}`);
        }

        // Try to drop the new index to force recreation
        try {
            if (indexesBefore.find((i: any) => i.name === 'buyer_1_ad_1')) {
                await collection.dropIndex('buyer_1_ad_1');
                results.push("Dropped index: buyer_1_ad_1");
            } else {
                results.push("Index buyer_1_ad_1 not found");
            }
        } catch (e: any) {
            results.push(`Failed to drop buyer_1_ad_1: ${e.message}`);
        }

        // List indexes after
        const indexesAfter = await collection.indexes();

        return NextResponse.json({
            success: true,
            results,
            indexesBefore,
            indexesAfter
        });
    } catch (error: any) {
        console.error("[FIX_DB]", error);
        return new NextResponse(`Error: ${error.message}`, { status: 500 });
    }
}
