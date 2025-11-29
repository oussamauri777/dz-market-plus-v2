import { NextResponse } from "next/server";
import dbConnect from "@/lib/db";
import Ad from "@/models/Ad";
import User from "@/models/User";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";

export async function POST(req: Request) {
    try {
        const session = await getServerSession(authOptions);

        if (!session) {
            return new NextResponse("Unauthorized", { status: 401 });
        }

        const { title, description, price, category, subcategory, wilaya, images, location, condition } = await req.json();

        if (!title || !description || !price || !category || !subcategory || !wilaya || !location?.commune || !condition) {
            return new NextResponse("Missing fields", { status: 400 });
        }

        // Validate image count
        if (images && images.length > 10) {
            return new NextResponse("Too many images (max 10)", { status: 400 });
        }

        await dbConnect();

        // Rate limiting
        const user = await User.findById(session.user.id);
        if (user.lastPostDate) {
            const lastPost = new Date(user.lastPostDate).getTime();
            const now = Date.now();
            const cooldown = 2 * 60 * 1000; // 2 minutes

            if (now - lastPost < cooldown) {
                return new NextResponse("Veuillez patienter quelques minutes avant de publier une nouvelle annonce", { status: 429 });
            }
        }

        const ad = await Ad.create({
            title,
            description,
            price,
            category,
            subcategory,
            wilaya,
            images,
            location,
            condition,
            user: session.user.id,
        });

        // Update user's last post date
        await User.findByIdAndUpdate(session.user.id, { lastPostDate: new Date() });

        return NextResponse.json(ad);
    } catch (error) {
        console.log("[ADS_POST]", error);
        return new NextResponse("Internal Error", { status: 500 });
    }
}

export async function GET(req: Request) {
    try {
        const { searchParams } = new URL(req.url);
        const category = searchParams.get("category");
        const wilaya = searchParams.get("wilaya");
        const commune = searchParams.get("commune");
        const condition = searchParams.get("condition");
        const query = searchParams.get("query");
        const ids = searchParams.get("ids");
        const limit = parseInt(searchParams.get("limit") || "10");
        const status = searchParams.get("status");

        await dbConnect();

        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        const filter: any = {};

        if (status) {
            filter.status = { $in: status.split(',') };
        } else {
            filter.status = 'active';
        }

        if (ids) {
            filter._id = { $in: ids.split(',') };
        }

        const user = searchParams.get("user");
        if (user) {
            filter.user = user;
        }

        if (category) {
            filter.category = category;
        }

        if (wilaya) {
            filter.wilaya = wilaya;
        }

        if (commune) {
            filter['location.commune'] = commune;
        }

        if (condition) {
            filter.condition = condition;
        }

        if (query) {
            filter.$or = [
                { title: { $regex: query, $options: "i" } },
                { description: { $regex: query, $options: "i" } },
            ];
        }

        const ads = await Ad.find(filter)
            .sort({ createdAt: -1 })
            .limit(limit)
            .populate("user", "name image");

        return NextResponse.json(ads);
    } catch (error) {
        console.log("[ADS_GET]", error);
        return new NextResponse("Internal Error", { status: 500 });
    }
}
