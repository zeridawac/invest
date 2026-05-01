const mongoose = require('mongoose');
const dotenv = require('dotenv');
dotenv.config();

console.log('Testing MongoDB connection...');
console.log('URI:', process.env.MONGO_URI ? 'Present' : 'Missing');

if (!process.env.MONGO_URI) {
  console.error('❌ MONGO_URI is missing from .env');
  process.exit(1);
}

mongoose.connect(process.env.MONGO_URI)
  .then(() => {
    console.log('✅ Connection successful');
    process.exit(0);
  })
  .catch(err => {
    console.error('❌ Connection failed:', err);
    process.exit(1);
  });
