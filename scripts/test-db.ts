import dns from 'node:dns';
dns.setDefaultResultOrder('ipv4first');

import fs from 'node:fs';
import path from 'node:path';

// Load .env.local programmatically before importing the database module
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

async function testConnection() {
    console.log('🔌 Converting connection string to standard mongodb:// format to bypass DNS SRV block...');
    
    const originalUri = process.env.MONGODB_URI || '';
    
    // We construct the direct shard URI
    // Extract credentials and host
    // originalUri format: mongodb+srv://username:password@cluster0.iaxgywf.mongodb.net/dz-market-plus?options
    const match = originalUri.match(/mongodb\+srv:\/\/([^:]+):([^@]+)@([^/]+)\/([^?]+)/);
    if (!match) {
        console.error('❌ MONGODB_URI is not in mongodb+srv format. Connection might fail.');
        return;
    }
    
    const [, username, password, host, dbName] = match;
    
    // We use the active Atlas shard hosts returned by the DNS query
    const directUri = `mongodb://${username}:${password}@` +
        `ac-fiep7rr-shard-00-00.iaxgywf.mongodb.net:27017,` +
        `ac-fiep7rr-shard-00-01.iaxgywf.mongodb.net:27017,` +
        `ac-fiep7rr-shard-00-02.iaxgywf.mongodb.net:27017` +
        `/${dbName}?ssl=true&authSource=admin&retryWrites=true&w=majority`;

    console.log('🔌 Connecting using standard URI...');
    
    try {
        await mongoose.connect(directUri, { bufferCommands: false });
        console.log('✅ Successfully connected to MongoDB Atlas directly!');
        
        const db = mongoose.connection.db;
        if (!db) {
            throw new Error('Database connection is not initialized.');
        }

        // List collections
        const collections = await db.listCollections().toArray();
        console.log(`📊 Found ${collections.length} collections:`);
        for (const col of collections) {
            const count = await db.collection(col.name).countDocuments();
            console.log(`   - ${col.name}: ${count} documents`);
        }
        
        await mongoose.disconnect();
        console.log('🔌 Disconnected successfully.');
        
        console.log('\n💡 Tip: You should update MONGODB_URI in your .env.local to this standard format to make the Next.js app connect successfully!');
        console.log(`Copy this connection string:\n${directUri}`);
    } catch (err: any) {
        console.error('❌ Failed to connect to MongoDB Atlas:', err.message);
        process.exit(1);
    }
}

testConnection();
