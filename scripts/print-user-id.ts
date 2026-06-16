import dns from 'node:dns';
dns.setDefaultResultOrder('ipv4first');

import fs from 'node:fs';
import path from 'node:path';

const envPath = path.resolve(__dirname, '../.env.local');
if (fs.existsSync(envPath)) {
    const envConfig = fs.readFileSync(envPath, 'utf-8');
    for (const line of envConfig.split('\n')) {
        const trimmed = line.trim();
        if (trimmed && !trimmed.startsWith('#') && trimmed.includes('=')) {
            const [key, ...values] = trimmed.split('=');
            process.env[key.trim()] = values.join('=').trim();
        }
    }
}

import mongoose from 'mongoose';

async function printUserId() {
    const uri = process.env.MONGODB_URI || '';
    if (!uri) {
        console.error('❌ MONGODB_URI is empty.');
        return;
    }

    try {
        await mongoose.connect(uri, { bufferCommands: false });
        const db = mongoose.connection.db;
        if (!db) throw new Error('DB not initialized');

        const user = await db.collection('users').findOne({ email: 'admin@dzmarket.com' });
        if (user) {
            console.log('USER_ID:', user._id.toString());
        } else {
            const anyUser = await db.collection('users').findOne({});
            if (anyUser) {
                console.log('USER_ID:', anyUser._id.toString());
            } else {
                console.log('NO_USER_FOUND');
            }
        }
        await mongoose.disconnect();
    } catch (err: any) {
        console.error('Error:', err.message);
    }
}

printUserId();
