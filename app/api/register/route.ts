import { NextResponse } from "next/server";
import bcrypt from "bcryptjs";
import dbConnect from "@/lib/db";
import User from "@/models/User";
import { rateLimit, getClientIdentifier } from "@/lib/rate-limit";

function validatePassword(password: string): string | null {
    const minLength = 8;
    const hasUpperCase = /[A-Z]/.test(password);
    const hasLowerCase = /[a-z]/.test(password);
    const hasNumber = /[0-9]/.test(password);

    if (password.length < minLength) return "Le mot de passe doit contenir au moins 8 caractères";
    if (!hasUpperCase) return "Le mot de passe doit contenir au moins une majuscule";
    if (!hasLowerCase) return "Le mot de passe doit contenir au moins une minuscule";
    if (!hasNumber) return "Le mot de passe doit contenir au moins un chiffre";
    return null;
}

export async function POST(req: Request) {
    try {
        // Rate limiting check
        const identifier = `register:${getClientIdentifier(req)}`;
        const rateLimitResult = await rateLimit(identifier, {
            windowMs: 15 * 60 * 1000, // 15 minutes
            maxAttempts: 3 // 3 registration attempts per 15 minutes
        });

        if (!rateLimitResult.success) {
            return NextResponse.json(
                { error: "Trop de tentatives. Veuillez réessayer plus tard." },
                { status: 429 }
            );
        }

        const { name, email, password, phone, wilaya } = await req.json();

        if (!name || !email || !password) {
            return NextResponse.json({ error: "Champs manquants" }, { status: 400 });
        }

        // Validate password strength
        const passwordError = validatePassword(password);
        if (passwordError) {
            return NextResponse.json({ error: passwordError }, { status: 400 });
        }

        await dbConnect();

        const existingUser = await User.findOne({ email });

        if (existingUser) {
            return NextResponse.json({ error: "Cet email est déjà utilisé" }, { status: 400 });
        }

        const hashedPassword = await bcrypt.hash(password, 12);

        const user = await User.create({
            name,
            email,
            password: hashedPassword,
            phone,
            wilaya,
        });

        return NextResponse.json(user);
    } catch (error) {
        console.log("[REGISTER_ERROR]", error);
        return NextResponse.json({ error: "Erreur interne" }, { status: 500 });
    }
}
