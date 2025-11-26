import { NextResponse } from "next/server";

export async function POST(req: Request) {
    try {
        const { phone, code } = await req.json();

        if (!phone || !code) {
            return new NextResponse("Phone and code required", { status: 400 });
        }

        // @ts-ignore
        const record = global.smsCodes?.get(phone);

        if (!record) {
            return new NextResponse("Code not found or expired", { status: 400 });
        }

        if (new Date() > record.expires) {
            // @ts-ignore
            global.smsCodes.delete(phone);
            return new NextResponse("Code expired", { status: 400 });
        }

        if (record.code !== code) {
            return new NextResponse("Invalid code", { status: 400 });
        }

        // Code is valid
        // We can delete it now or keep it for the registration step
        // Let's keep it but mark as verified if we had a more complex flow
        // For now, just return success

        return NextResponse.json({ success: true });
    } catch (error) {
        console.error("[SMS_VERIFY]", error);
        return new NextResponse("Internal Error", { status: 500 });
    }
}
