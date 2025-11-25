import { NextResponse } from "next/server";
import dbConnect from "@/lib/db";
import Review from "@/models/Review";
import User from "@/models/User";
import Ad from "@/models/Ad";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";

export async function POST(req: Request) {
    try {
        const session = await getServerSession(authOptions);

        if (!session) {
            return new NextResponse("Unauthorized", { status: 401 });
        }

        const { targetUserId, adId, rating, comment } = await req.json();

        if (!targetUserId || !adId || !rating || !comment) {
            console.log("[REVIEWS_POST] Missing fields:", { targetUserId, adId, rating, comment });
            return new NextResponse("Missing fields", { status: 400 });
        }

        // Validate ObjectIds
        const isValidObjectId = (id: string) => /^[0-9a-fA-F]{24}$/.test(id);
        if (!isValidObjectId(targetUserId) || !isValidObjectId(adId)) {
            console.log("[REVIEWS_POST] Invalid IDs:", { targetUserId, adId });
            return new NextResponse("Invalid User ID or Ad ID", { status: 400 });
        }

        if (session.user.id === targetUserId) {
            return new NextResponse("Cannot review yourself", { status: 400 });
        }

        await dbConnect();

        // Check if review already exists
        const existingReview = await Review.findOne({
            buyer: session.user.id,
            ad: adId
        });

        if (existingReview) {
            return new NextResponse("Review already exists for this ad", { status: 400 });
        }

        const review = await Review.create({
            rating,
            comment,
            buyer: session.user.id,
            seller: targetUserId,
            ad: adId,
        });

        return NextResponse.json(review);
    } catch (error: any) {
        console.error("[REVIEWS_POST] Error:", error);
        return new NextResponse(`Internal Error: ${error.message}`, { status: 500 });
    }
}

export async function GET(req: Request) {
    try {
        const { searchParams } = new URL(req.url);
        const sellerId = searchParams.get("sellerId");
        const page = parseInt(searchParams.get("page") || "1");
        const limit = parseInt(searchParams.get("limit") || "5");
        const skip = (page - 1) * limit;

        if (!sellerId) {
            return new NextResponse("Seller ID required", { status: 400 });
        }

        await dbConnect();

        const reviews = await Review.find({ seller: sellerId })
            .sort({ createdAt: -1 })
            .skip(skip)
            .limit(limit)
            .populate("buyer", "name image")
            .populate("ad", "title");

        const total = await Review.countDocuments({ seller: sellerId });

        return NextResponse.json({
            reviews,
            pagination: {
                total,
                pages: Math.ceil(total / limit),
                page,
                limit
            }
        });
    } catch (error) {
        console.log("[REVIEWS_GET]", error);
        return new NextResponse("Internal Error", { status: 500 });
    }
}
