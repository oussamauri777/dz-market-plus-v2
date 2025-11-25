import { NextResponse } from 'next/server';
import { searchAds } from '@/lib/services/search';

export async function GET(req: Request) {
    try {
        const { searchParams } = new URL(req.url);
        const params = Object.fromEntries(searchParams.entries());

        const result = await searchAds(params);

        return NextResponse.json(result);
    } catch (error) {
        console.error('[SEARCH_API]', error);
        return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
    }
}
