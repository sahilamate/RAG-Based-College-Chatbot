import mongoose from 'mongoose';
import dotenv from 'dotenv';
import User from './models/User.js';
import Document from './models/Document.js';
import connectDB from './config/db.js';

dotenv.config();

const seedData = async () => {
  try {
    await connectDB();

    console.log('[Seeder] Cleaning existing user records...');
    await User.deleteMany({ email: { $in: ['student@college.com', 'admin@college.com'] } });

    console.log('[Seeder] Seeding default Student & Admin accounts...');

    await User.create({
      name: 'Sahil Sharma',
      email: 'student@college.com',
      password: 'student123',
      studentId: 'STU2026042',
      department: 'Computer Engineering',
      role: 'student'
    });

    await User.create({
      name: 'Dr. Rajesh Varma',
      email: 'admin@college.com',
      password: 'admin123',
      studentId: 'ADM1004',
      department: 'Academic Affairs',
      role: 'admin'
    });

    console.log('==================================================');
    console.log('✅ Seeding completed successfully!');
    console.log('Student Creds: student@college.com / student123');
    console.log('Admin Creds:   admin@college.com / admin123');
    console.log('==================================================');

    process.exit(0);
  } catch (error) {
    console.error('[Seeder] Error:', error.message);
    process.exit(1);
  }
};

seedData();
