import { NextResponse } from "next/server";
import dbConnect from "@/lib/db";
import Review from "@/models/Review";
import User from "@/models/User";
import Ad from "@/models/Ad";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { getUserIdFromRequest } from '@/lib/mobile-auth';

export async function POST(req: Request) {
    try {
        const session = await getServerSession(authOptions);
        const userId = session?.user?.id || getUserIdFromRequest(req);

        if (!userId) {
            return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
        }

        const { targetUserId, adId, rating, comment } = await req.json();

        if (!targetUserId || !adId || !rating || !comment) {
            console.log("[REVIEWS_POST] Missing fields:", { targetUserId, adId, rating, comment });
            return NextResponse.json({ error: "Missing fields" }, { status: 400 });
        }

        // Validate ObjectIds
        const isValidObjectId = (id: string) => /^[0-9a-fA-F]{24}$/.test(id);
        if (!isValidObjectId(targetUserId) || !isValidObjectId(adId)) {
            console.log("[REVIEWS_POST] Invalid IDs:", { targetUserId, adId });
            return NextResponse.json({ error: "Invalid User ID or Ad ID" }, { status: 400 });
        }

        if (userId === targetUserId) {
            return NextResponse.json({ error: "Cannot review yourself" }, { status: 400 });
        }

        await dbConnect();

        // Check if review already exists
        const existingReview = await Review.findOne({
            buyer: userId,
            ad: adId
        });

        if (existingReview) {
            return NextResponse.json({ error: "Review already exists for this ad" }, { status: 400 });
        }

        const review = await Review.create({
            rating,
            comment,
            buyer: userId,
            seller: targetUserId,
            ad: adId,
        });

        return NextResponse.json(review);
    } catch (error: any) {
        console.error("[REVIEWS_POST] Error:", error);
        return NextResponse.json({ error: `Internal Error: ${error.message}` }, { status: 500 });
    }
}

export async function GET(req: Request) {
    try {
        const { searchParams } = new URL(req.url);
        const sellerId = searchParams.get("sellerId");
        const buyerId = searchParams.get("buyerId");
        const adId = searchParams.get("adId");
        const page = parseInt(searchParams.get("page") || "1");
        const limit = parseInt(searchParams.get("limit") || "5");
        const skip = (page - 1) * limit;

        if (!sellerId && !buyerId && !adId) {
            return NextResponse.json({ error: "Seller ID, Buyer ID or Ad ID required" }, { status: 400 });
        }

        await dbConnect();

        const filter: any = {};
        if (sellerId) filter.seller = sellerId;
        if (buyerId) filter.buyer = buyerId;
        if (adId) filter.ad = adId;

        const reviews = await Review.find(filter)
            .sort({ createdAt: -1 })
            .skip(skip)
            .limit(limit)
            .populate("buyer", "name image")
            .populate("seller", "name image")
            .populate("ad", "title");

        const total = await Review.countDocuments(filter);

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
        return NextResponse.json({ error: "Internal Error" }, { status: 500 });
    }
}
