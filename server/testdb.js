import mongoose from 'mongoose';
import dotenv from 'dotenv';
import path from 'path';
import { fileURLToPath } from 'url';
import fs from 'fs';

// Get current directory
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Load .env
const envPath = path.join(__dirname, '.env');
console.log(`📁 Looking for .env at: ${envPath}`);
console.log(`📁 .env exists: ${fs.existsSync(envPath)}`);

dotenv.config({ path: envPath });

// 🔧 FIX: Use MONGO_URI instead of MONGODB_URI
const MONGODB_URI = process.env.MONGO_URI || process.env.MONGODB_URI;

console.log('\n📋 Environment variables loaded:');
console.log(`   MONGO_URI: ${process.env.MONGO_URI ? '✅ Set' : '❌ NOT SET'}`);
console.log(`   MONGODB_URI: ${process.env.MONGODB_URI ? '✅ Set' : '❌ NOT SET'}`);
console.log(`   PORT: ${process.env.PORT || '❌ NOT SET'}`);
console.log(`   JWT_SECRET: ${process.env.JWT_SECRET ? '✅ Set' : '❌ NOT SET'}`);

async function testConnection() {
    if (!MONGODB_URI) {
        console.error('\n❌ MONGO_URI is not defined in .env file!');
        console.log('\n💡 Please update your .env file with:');
        console.log('   MONGO_URI=mongodb://localhost:27017/mineral_water');
        console.log('\n   OR for MongoDB Atlas:');
        console.log('   MONGO_URI=mongodb+srv://<username>:<password>@cluster.mongodb.net/database_name');
        return;
    }

    try {
        console.log('\n🔄 Attempting to connect to MongoDB...');
        const hiddenUri = MONGODB_URI.replace(/\/\/[^:]+:[^@]+@/, '//<hidden>:<hidden>@');
        console.log(`📡 Using URI: ${hiddenUri}`);
        
        await mongoose.connect(MONGODB_URI, {
            serverSelectionTimeoutMS: 5000,
            family: 4,
        });
        
        console.log('✅ Connected to MongoDB successfully!');
        console.log(`📊 Database: ${mongoose.connection.db.databaseName}`);
        console.log(`🔗 Host: ${mongoose.connection.host}`);
        
        await mongoose.disconnect();
        console.log('👋 Disconnected');
    } catch (error) {
        console.error('❌ Connection error:', error.message);
        
        if (error.message.includes('ECONNREFUSED')) {
            console.log('\n💡 MongoDB is not running locally. Try:');
            console.log('   1. Start MongoDB: mongod --dbpath C:\\data\\db');
            console.log('   2. Or use MongoDB Atlas with a valid connection string');
        }
    }
}

testConnection();