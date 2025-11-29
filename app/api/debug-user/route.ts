import { NextResponse } from "next/server";
import dbConnect from "@/lib/db";
import User from "@/models/User";

export async function GET(req: Request) {
    try {
        await dbConnect();
        // Fetch all users but only select email and reset fields
        const users = await User.find({}).select('email resetPasswordToken resetPasswordExpires role');

        return NextResponse.json({
            count: users.length,
            users: users
        });
    } catch (error: any) {
        return NextResponse.json({ error: error.message }, { status: 500 });
    }
}
