import { NextResponse } from "next/server";
import dbConnect from "@/lib/db";
import User from "@/models/User";
import Ad from "@/models/Ad";
import Review from "@/models/Review";

export async function GET(
    req: Request,
    { params }: { params: Promise<{ id: string }> }
) {
    try {
        await dbConnect();

        const { id } = await params;
        const user = await User.findById(id).select('name email image bio wilaya badges createdAt');

        if (!user) {
            return new NextResponse("User not found", { status: 404 });
        }

        // Get total ads
        const totalAds = await Ad.countDocuments({ user: id, status: 'active' });

        // Get average rating
        const reviews = await Review.find({ seller: id });
        const totalReviews = reviews.length;
        const averageRating = totalReviews > 0
            ? reviews.reduce((acc: number, review: any) => acc + review.rating, 0) / totalReviews
            : 0;

        // Get rating breakdown
        const ratingBreakdown = {
            5: reviews.filter((r: any) => r.rating === 5).length,
            4: reviews.filter((r: any) => r.rating === 4).length,
            3: reviews.filter((r: any) => r.rating === 3).length,
            2: reviews.filter((r: any) => r.rating === 2).length,
            1: reviews.filter((r: any) => r.rating === 1).length,
        };

        return NextResponse.json({
            user,
            stats: {
                totalAds,
                totalReviews,
                averageRating: parseFloat(averageRating.toFixed(1)),
                ratingBreakdown
            }
        });
    } catch (error) {
        console.log("[USER_GET]", error);
        return new NextResponse("Internal Error", { status: 500 });
    }
}
