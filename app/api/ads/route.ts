import { NextResponse } from "next/server";
import dbConnect from "@/lib/db";
import Ad from "@/models/Ad";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";

export async function POST(req: Request) {
    try {
        const session = await getServerSession(authOptions);

        if (!session) {
            return new NextResponse("Unauthorized", { status: 401 });
        }

        const { title, description, price, category, subcategory, wilaya, images, location } = await req.json();

        if (!title || !description || !price || !category || !subcategory || !wilaya) {
            return new NextResponse("Missing fields", { status: 400 });
        }

        await dbConnect();

        const ad = await Ad.create({
            title,
            description,
            price,
            category,
            subcategory,
            wilaya,
            images,
            location,
            user: session.user.id,
        });

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
        const query = searchParams.get("query");
        const ids = searchParams.get("ids");
        const limit = parseInt(searchParams.get("limit") || "10");

        await dbConnect();

        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        const filter: any = { status: 'active' };

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
