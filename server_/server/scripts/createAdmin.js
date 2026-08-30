import mongoose from 'mongoose';
import dotenv from 'dotenv';
import path from 'path';
import { fileURLToPath } from 'url';
import User from '../models/User.js';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

dotenv.config({ path: path.join(__dirname, '../.env') });

const createAdminAccount = async () => {
  try {
    const mongoUri = process.env.MONGO_URI || 'mongodb://localhost:27017/collegeai';
    await mongoose.connect(mongoUri);
    console.log(`[CreateAdmin] Connected to MongoDB: ${mongoUri}`);

    const adminName = process.env.ADMIN_NAME || 'College Administrator';
    const adminEmail = (process.env.ADMIN_EMAIL || 'admin@college.com').toLowerCase().trim();
    const adminPassword = process.env.ADMIN_PASSWORD || 'admin123';

    let admin = await User.findOne({ email: adminEmail });

    if (admin) {
      console.log(`[CreateAdmin] Updating existing admin account: ${adminEmail}`);
      admin.name = adminName;
      admin.password = adminPassword;
      admin.role = 'admin';
      await admin.save();
    } else {
      console.log(`[CreateAdmin] Creating new admin account: ${adminEmail}`);
      admin = await User.create({
        name: adminName,
        email: adminEmail,
        password: adminPassword,
        department: 'Academic Affairs',
        studentId: 'ADM1001',
        role: 'admin'
      });
    }

    console.log('==================================================');
    console.log('✅ Admin Account Successfully Provisioned!');
    console.log(`Name:  ${admin.name}`);
    console.log(`Email: ${admin.email}`);
    console.log(`Role:  ${admin.role}`);
    console.log('==================================================');

    process.exit(0);
  } catch (error) {
    console.error('[CreateAdmin] Error provisioning admin:', error.message);
    process.exit(1);
  }
};

createAdminAccount();
