import { NextResponse } from "next/server";
import jwt from "jsonwebtoken";
import bcrypt from "bcryptjs";
import dbConnect from "@/lib/db";
import User from "@/models/User";
import { rateLimit, getClientIdentifier } from "@/lib/rate-limit";

export async function POST(req: Request) {
    try {
        const identifier = `mobile-login:${getClientIdentifier(req)}`;
        const rateLimitResult = await rateLimit(identifier, {
            windowMs: 5 * 60 * 1000,
            maxAttempts: 5
        });

        if (!rateLimitResult.success) {
            return NextResponse.json(
                { error: "Trop de tentatives. Veuillez réessayer plus tard." },
                { status: 429 }
            );
        }

        const body = await req.json();
        const { email, password } = body;

        if (!email || !password) {
            return NextResponse.json({ error: "Email et mot de passe requis" }, { status: 400 });
        }

        await dbConnect();

        const user = await User.findOne({ email }).select("+password");

        if (!user || !user.password) {
            return NextResponse.json({ error: "Identifiants incorrects" }, { status: 401 });
        }

        const isPasswordValid = await bcrypt.compare(password, user.password);

        if (!isPasswordValid) {
            return NextResponse.json({ error: "Identifiants incorrects" }, { status: 401 });
        }

        const jwtSecret = process.env.NEXTAUTH_SECRET || "fallback-secret";
        const token = jwt.sign(
            { id: user._id.toString(), email: user.email, role: user.role },
            jwtSecret,
            { expiresIn: "30d" }
        );

        return NextResponse.json({
            token,
            user: {
                id: user._id.toString(),
                _id: user._id.toString(),
                name: user.name,
                email: user.email,
                image: user.image,
                wilaya: user.wilaya,
                phone: user.phone,
                role: user.role,
                badges: user.badges || { emailVerified: false, phoneVerified: false, identityVerified: false },
                bio: user.bio || "",
                viewedCategories: user.viewedCategories || [],
                recentlyViewedAds: user.recentlyViewedAds || [],
                favorites: user.favorites || [],
                createdAt: user.createdAt?.toISOString() || new Date().toISOString(),
                updatedAt: user.updatedAt?.toISOString() || new Date().toISOString(),
            }
        });

    } catch (error) {
        console.error("[MOBILE_LOGIN_ERROR]", error);
        return NextResponse.json({ error: "Erreur interne du serveur" }, { status: 500 });
    }
}
