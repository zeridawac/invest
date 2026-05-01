const mongoose = require('mongoose');
const dotenv = require('dotenv');
dotenv.config({ path: './backend/.env' });

console.log('Testing MongoDB connection...');
console.log('URI:', process.env.MONGO_URI ? 'Present' : 'Missing');

mongoose.connect(process.env.MONGO_URI)
  .then(() => {
    console.log('✅ Connection successful');
    process.exit(0);
  })
  .catch(err => {
    console.error('❌ Connection failed:', err);
    process.exit(1);
  });
