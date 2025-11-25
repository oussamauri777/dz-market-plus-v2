const { searchAds } = require('../lib/services/search');
const mongoose = require('mongoose');
require('dotenv').config({ path: '.env.local' });

async function test() {
    try {
        await mongoose.connect(process.env.MONGODB_URI);
        console.log('Connected to DB');

        const result = await searchAds({ limit: '5' });
        console.log('Total Ads:', result.pagination.total);
        console.log('First Ad:', result.ads[0]?.title);

        process.exit(0);
    } catch (e) {
        console.error(e);
        process.exit(1);
    }
}

// Mock Next.js internal imports if needed or just use the API route via fetch
// Since searchAds uses '@/lib/db', running it directly with node might fail due to alias.
// So I'll use fetch to the running server instead.

async function testFetch() {
    try {
        const res = await fetch('http://localhost:3000/api/search?limit=5');
        const data = await res.json();
        console.log('Status:', res.status);
        console.log('Total:', data.pagination?.total);
        console.log('Ads:', data.ads?.length);
    } catch (e) {
        console.error(e);
    }
}

testFetch();
