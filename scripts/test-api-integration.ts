const BASE_URL = 'https://dz-market-plus-v2.vercel.app';

async function runTests() {
    console.log('🚀 Starting API Integration Test for DzMarket Plus...');
    console.log(`🌍 Target Base URL: ${BASE_URL}\n`);

    let cookies: string[] = [];

    // --- STEP 1: LOGIN TEST ---
    console.log('🔐 [TEST 1] Testing User Login via NextAuth Credentials...');
    try {
        // A. Get CSRF Token and initial cookies
        const csrfRes = await fetch(`${BASE_URL}/api/auth/csrf`);
        if (!csrfRes.ok) {
            throw new Error(`Failed to fetch CSRF token: ${csrfRes.statusText}`);
        }
        const csrfData = (await csrfRes.json()) as { csrfToken: string };
        const csrfToken = csrfData.csrfToken;
        const initialCookies = csrfRes.headers.get('set-cookie') || '';
        console.log('✅ Fetched CSRF Token successfully.');

        // B. Login POST with credentials
        const loginParams = new URLSearchParams();
        loginParams.append('csrfToken', csrfToken);
        loginParams.append('email', 'amine@test.com');
        loginParams.append('password', 'password123');
        loginParams.append('json', 'true');

        const loginRes = await fetch(`${BASE_URL}/api/auth/callback/credentials`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/x-www-form-urlencoded',
                'Cookie': initialCookies,
            },
            body: loginParams.toString(),
        });

        if (!loginRes.ok) {
            throw new Error(`Login POST request failed: ${loginRes.statusText}`);
        }

        const loginResult = await loginRes.json();
        const loginCookies = loginRes.headers.get('set-cookie') || '';

        // Extract session cookies
        if (loginCookies) {
            cookies = loginCookies.split(',').map(c => c.split(';')[0]);
        }

        if (cookies.length === 0) {
            throw new Error('No session cookies returned after credentials validation.');
        }

        console.log('✅ Login succeeded! Extracted session cookies.');
        console.log(`   Session Token Cookie: ${cookies.find(c => c.includes('session-token')) || 'Found'}\n`);
    } catch (err: any) {
        console.error('❌ [TEST 1] Login Test Failed:', err.message);
        process.exit(1);
    }

    // --- STEP 2: FETCHING LISTINGS TEST ---
    console.log('📋 [TEST 2] Testing Fetching Listings (GET /api/ads)...');
    try {
        const fetchRes = await fetch(`${BASE_URL}/api/ads?limit=5`);
        if (!fetchRes.ok) {
            throw new Error(`Failed to fetch ads: ${fetchRes.statusText}`);
        }
        const ads = (await fetchRes.json()) as any[];
        console.log(`✅ Successfully fetched ${ads.length} listings.`);
        if (ads.length > 0) {
            console.log(`   Sample Listing: "${ads[0].title}" - ${ads[0].price} DA (Posted by ${ads[0].user?.name})`);
        }
        console.log('');
    } catch (err: any) {
        console.error('❌ [TEST 2] Fetching Listings Test Failed:', err.message);
        process.exit(1);
    }

    // --- STEP 3: UPLOADING NEW LISTING TEST ---
    console.log('📤 [TEST 3] Testing Uploading New Listing (POST /api/ads)...');
    let createdAdId: string | null = null;
    try {
        const dummyAd = {
            title: 'TEST ITEM Integration Suite (Auto)',
            description: 'This is a temporary listing created by the API integration test suite. It will be deleted automatically.',
            price: 9999,
            category: 'Informatique',
            subcategory: 'Accessoires',
            wilaya: 'Alger',
            condition: 'new',
            location: {
                address: 'Alger Centre',
                wilaya: 'Alger',
                commune: 'Centre',
                latitude: 36.7528,
                longitude: 3.042
            },
            images: ['https://images.unsplash.com/photo-1618366712010-f4ae9c647dcb']
        };

        const postRes = await fetch(`${BASE_URL}/api/ads`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'Cookie': cookies.join('; '),
            },
            body: JSON.stringify(dummyAd),
        });

        if (!postRes.ok) {
            const errBody = await postRes.text();
            throw new Error(`Failed to upload listing (${postRes.status}): ${errBody}`);
        }

        const createdAd = (await postRes.json()) as any;
        createdAdId = createdAd._id;
        console.log(`✅ Successfully created test listing:`);
        console.log(`   ID: ${createdAdId}`);
        console.log(`   Title: "${createdAd.title}"`);
        console.log(`   Price: ${createdAd.price} DA\n`);
    } catch (err: any) {
        console.error('❌ [TEST 3] Uploading New Listing Test Failed:', err.message);
        process.exit(1);
    }

    // --- STEP 4: CLEANUP TEST (DELETE LISTING) ---
    if (createdAdId) {
        console.log('🧹 [CLEANUP] Deleting temporary test listing...');
        try {
            const deleteRes = await fetch(`${BASE_URL}/api/ads/${createdAdId}`, {
                method: 'DELETE',
                headers: {
                    'Cookie': cookies.join('; '),
                }
            });

            if (!deleteRes.ok) {
                const errBody = await deleteRes.text();
                throw new Error(`Failed to delete listing (${deleteRes.status}): ${errBody}`);
            }

            const delResult = (await deleteRes.json()) as any;
            console.log(`✅ Cleanup successful: ${delResult.message || 'Ad deleted.'}\n`);
        } catch (err: any) {
            console.error('⚠️ [CLEANUP] Warning: Failed to delete test listing:', err.message);
        }
    }

    console.log('🎉 All API integration tests completed successfully!');
}

runTests().catch(err => {
    console.error('Unhandled failure:', err);
    process.exit(1);
});
