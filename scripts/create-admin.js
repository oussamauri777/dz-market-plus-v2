require('dotenv').config({ path: '.env.local' });
const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');

// MongoDB connection
const MONGODB_URI = process.env.MONGODB_URI;

// User Schema (inline)
const UserSchema = new mongoose.Schema({
    name: String,
    email: { type: String, unique: true },
    password: String,
    image: String,
    phone: String,
    wilaya: String,
    role: { type: String, enum: ['user', 'admin'], default: 'user' },
    createdAt: { type: Date, default: Date.now },
});

const User = mongoose.models.User || mongoose.model('User', UserSchema);

async function createAdmin() {
    try {
        console.log('Connecting to MongoDB...');
        await mongoose.connect(MONGODB_URI);
        console.log('✅ Connected to MongoDB');

        // Check if admin already exists
        const existingAdmin = await User.findOne({ email: 'admin@dzmarket.com' });

        if (existingAdmin) {
            console.log('✅ Admin user already exists!');
            console.log('Email:', existingAdmin.email);
            console.log('Role:', existingAdmin.role);
            await mongoose.connection.close();
            process.exit(0);
        }

        // Hash password
        const hashedPassword = await bcrypt.hash('admin123', 10);

        // Create admin user
        await User.create({
            name: 'Admin',
            email: 'admin@dzmarket.com',
            password: hashedPassword,
            role: 'admin',
            phone: '0000000000',
            wilaya: 'Alger',
        });

        console.log('✅ Admin user created successfully!');
        console.log('📧 Email: admin@dzmarket.com');
        console.log('🔑 Password: admin123');
        console.log('⚠️  IMPORTANT: Please change this password after first login!');

        await mongoose.connection.close();
        process.exit(0);
    } catch (error) {
        console.error('❌ Error creating admin user:', error);
        await mongoose.connection.close();
        process.exit(1);
    }
}

createAdmin();
