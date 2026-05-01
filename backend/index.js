const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');
const dotenv = require('dotenv');
const http = require('http');
const { Server } = require('socket.io');
const path = require('path');

dotenv.config();

console.log("🚀 Starting backend...");
console.log("📍 PORT:", process.env.PORT);
console.log("🌐 NODE_ENV:", process.env.NODE_ENV);
console.log("📦 Working Directory:", process.cwd());

const app = express();
const server = http.createServer(app);
const io = new Server(server, {
  cors: {
    origin: "*",
    methods: ["GET", "POST", "PUT", "DELETE"]
  }
});

app.use(cors());
app.use(express.json());
app.use('/uploads', express.static(path.join(__dirname, 'uploads')));

app.use('/api/auth', require('./routes/auth'));
app.use('/api/users', require('./routes/user'));
app.use('/api/coins', require('./routes/coin'));
app.use('/api/investments', require('./routes/investment'));
app.use('/api/games', require('./routes/game'));
app.use('/api/admin', require('./routes/admin'));
app.use('/api/withdrawals', require('./routes/withdrawal'));
app.use('/api/coupons', require('./routes/coupon'));

app.get('/api/status', (req, res) => {
  res.json({ message: "Reda Invest API is running successfully! 🚀" });
});

app.get('/', (req, res) => {
  res.send('API is running 🚀');
});

io.on('connection', (socket) => {
  console.log('User connected:', socket.id);
  socket.on('disconnect', () => {
    console.log('User disconnected');
  });
});

const { startMarketSimulation } = require('./utils/market');

const PORT = process.env.PORT || 5000;

server.listen(PORT, "0.0.0.0", async () => {
  console.log(`✅ Server is officially running and listening on 0.0.0.0:${PORT}`);

  if (!process.env.MONGO_URI) {
    console.error('❌ CRITICAL: MONGO_URI is missing!');
    return;
  }

  try {
    console.log('Attempting to connect to MongoDB...');
    await mongoose.connect(process.env.MONGO_URI, {
      serverSelectionTimeoutMS: 10000
    });

    console.log('✅ MongoDB Connected Successfully');

    startMarketSimulation(io);
    console.log('✅ Market simulation started');
  } catch (err) {
    console.error('❌ MongoDB Connection Error Details:');
    console.error('Error Name:', err.name);
    console.error('Error Message:', err.message);
    console.error('Error Code:', err.code);
  }
});

process.on('uncaughtException', (err) => {
  console.error('Uncaught Exception:', err);
});

process.on('unhandledRejection', (reason, promise) => {
  console.error('Unhandled Rejection at:', promise, 'reason:', reason);
});

module.exports = { io };