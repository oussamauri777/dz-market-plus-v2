import { NextResponse } from "next/server";

export async function POST(req: Request) {
    try {
        const { email, code } = await req.json();

        if (!email || !code) {
            return NextResponse.json({ error: "Email and code required" }, { status: 400 });
        }

        // @ts-ignore
        const record = global.emailCodes?.get(email);

        if (!record) {
            return NextResponse.json({ error: "Code not found or expired" }, { status: 400 });
        }

        if (new Date() > record.expires) {
            // @ts-ignore
            global.emailCodes.delete(email);
            return NextResponse.json({ error: "Code expired" }, { status: 400 });
        }

        if (record.code !== code) {
            return NextResponse.json({ error: "Invalid code" }, { status: 400 });
        }

        // Code is valid - clean up
        // @ts-ignore
        global.emailCodes.delete(email);

        return NextResponse.json({ success: true });
    } catch (error) {
        console.error("[EMAIL_VERIFY]", error);
        return NextResponse.json({ error: "Internal Error" }, { status: 500 });
    }
}
