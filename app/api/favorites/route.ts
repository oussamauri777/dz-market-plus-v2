import { NextResponse } from "next/server";
import dbConnect from "@/lib/db";
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

        const { adId } = await req.json();

        if (!adId) {
            return new NextResponse("Ad ID required", { status: 400 });
        }

        await dbConnect();

        const user = await User.findById(session.user.id);

        if (!user) {
            return new NextResponse("User not found", { status: 404 });
        }

        const isFavorite = user.favorites.includes(adId);

        if (isFavorite) {
            user.favorites = user.favorites.filter((id: string) => id.toString() !== adId);
        } else {
            user.favorites.push(adId);
        }

        await user.save();

        return NextResponse.json({ isFavorite: !isFavorite, favorites: user.favorites });
    } catch (error) {
        console.log("[FAVORITES_POST]", error);
        return new NextResponse("Internal Error", { status: 500 });
    }
}

export async function GET(req: Request) {
    try {
        const session = await getServerSession(authOptions);

        if (!session) {
            return new NextResponse("Unauthorized", { status: 401 });
        }

        await dbConnect();

        const user = await User.findById(session.user.id).populate({
            path: 'favorites',
            model: Ad,
            populate: {
                path: 'user',
                select: 'name image'
            }
        });

        if (!user) {
            return new NextResponse("User not found", { status: 404 });
        }

        return NextResponse.json(user.favorites);
    } catch (error) {
        console.log("[FAVORITES_GET]", error);
        return new NextResponse("Internal Error", { status: 500 });
    }
}
