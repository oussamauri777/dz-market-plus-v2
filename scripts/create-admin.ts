const dbConnect = require('../lib/db').default;
const User = require('../models/User').default;
const bcrypt = require('bcryptjs');

async function createAdmin() {
    try {
        await dbConnect();

        // Check if admin already exists
        const existingAdmin = await User.findOne({ email: 'admin@dzmarket.com' });

        if (existingAdmin) {
            console.log('✅ Admin user already exists!');
            console.log('Email:', existingAdmin.email);
            console.log('Role:', existingAdmin.role);
            process.exit(0);
            return;
        }

        // Hash password
        const hashedPassword = await bcrypt.hash('admin123', 10);

        // Create admin user
        const admin = await User.create({
            name: 'Admin',
            email: 'admin@dzmarket.com',
            password: hashedPassword,
            role: 'admin',
            phone: '0000000000',
            wilaya: 'Alger',
        });

        console.log('✅ Admin user created successfully!');
        console.log('Email: admin@dzmarket.com');
        console.log('Password: admin123');
        console.log('⚠️  Please change this password after first login!');

        process.exit(0);
    } catch (error) {
        console.error('❌ Error creating admin user:', error);
        process.exit(1);
    }
}

createAdmin();
