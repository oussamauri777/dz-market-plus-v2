import { NextResponse } from "next/server";
import jwt from "jsonwebtoken";
import dbConnect from "@/lib/db";
import User from "@/models/User";

export async function POST(req: Request) {
    try {
        const body = await req.json();
        const { email, name, image, idToken } = body;

        if (!email) {
            return NextResponse.json({ error: "Email est requis" }, { status: 400 });
        }

        if (!idToken) {
            return NextResponse.json({ error: "Token Google manquant" }, { status: 400 });
        }

        // Verify the Google ID token
        let verifiedEmail = email;
        let verifiedName = name;
        let verifiedImage = image;

        try {
            const googleResponse = await fetch(
                `https://oauth2.googleapis.com/tokeninfo?id_token=${idToken}`
            );
            const googleData = await googleResponse.json();

            if (!googleResponse.ok || googleData.email !== email) {
                return NextResponse.json({ error: "Token Google invalide" }, { status: 401 });
            }

            verifiedEmail = googleData.email;
            verifiedName = googleData.name || name;
            verifiedImage = googleData.picture || image;
        } catch {
            return NextResponse.json({ error: "Échec de vérification du token Google" }, { status: 401 });
        }

        await dbConnect();

        let user = await User.findOne({ email: verifiedEmail });

        if (!user) {
            user = await User.create({
                name: verifiedName || "Google User",
                email: verifiedEmail,
                image: verifiedImage || "",
                badges: { emailVerified: true },
                role: "user",
            });
        } else if (!user.badges?.emailVerified) {
            user.badges.emailVerified = true;
            await user.save();
        }

        const jwtSecret = process.env.NEXTAUTH_SECRET || "fallback-secret";

        const token = jwt.sign(
            {
                id: user._id.toString(),
                email: user.email,
                role: user.role,
            },
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
                badges: user.badges || { emailVerified: true, phoneVerified: false, identityVerified: false },
                bio: user.bio || "",
                viewedCategories: user.viewedCategories || [],
                recentlyViewedAds: user.recentlyViewedAds || [],
                favorites: user.favorites || [],
                createdAt: user.createdAt?.toISOString() || new Date().toISOString(),
                updatedAt: user.updatedAt?.toISOString() || new Date().toISOString(),
            }
        });

    } catch (error) {
        console.error("[MOBILE_GOOGLE_LOGIN_ERROR]", error);
        return NextResponse.json({ error: "Erreur interne du serveur" }, { status: 500 });
    }
}
