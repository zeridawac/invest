const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');
const dotenv = require('dotenv');
const http = require('http');
const { Server } = require('socket.io');
const path = require('path');

dotenv.config();

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

// Database Connection
console.log('Attempting to connect to MongoDB...');
mongoose.connect(process.env.MONGO_URI)
  .then(() => console.log('✅ MongoDB Connected Successfully'))
  .catch(err => {
    console.error('❌ MongoDB Connection Error:', err);
    // Don't exit, let the server start so we can at least see the health check
  });

// Socket.io
io.on('connection', (socket) => {
  console.log('User connected:', socket.id);
  socket.on('disconnect', () => {
    console.log('User disconnected');
  });
});

// Routes
app.use('/api/auth', require('./routes/auth'));
app.use('/api/users', require('./routes/user'));
app.use('/api/coins', require('./routes/coin'));
app.use('/api/investments', require('./routes/investment'));
app.use('/api/games', require('./routes/game'));
app.use('/api/admin', require('./routes/admin'));
app.use('/api/withdrawals', require('./routes/withdrawal'));
app.use('/api/coupons', require('./routes/coupon'));

// API Status Check
app.get('/api/status', (req, res) => {
  res.json({ message: "Reda Invest API is running successfully! 🚀" });
});

// Serve Frontend Static Files
app.use(express.static(path.join(__dirname, '../frontend/dist')));

// Catch-all route for React Router (must be last)
app.use((req, res) => {
  res.sendFile(path.join(__dirname, '../frontend/dist', 'index.html'));
});


const { startMarketSimulation } = require('./utils/market');

const PORT = process.env.PORT || 5000;
console.log(`Starting server on port ${PORT}...`);

server.listen(PORT, '0.0.0.0', (err) => {
  if (err) {
    console.error('❌ Server failed to start:', err);
    return;
  }
  console.log(`✅ Server is officially running and listening on 0.0.0.0:${PORT}`);
  try {
    startMarketSimulation(io);
    console.log('✅ Market simulation started');
  } catch (simErr) {
    console.error('⚠️ Market simulation failed to start:', simErr);
  }
});

// Prevent server crash on unhandled errors
process.on('uncaughtException', (err) => {
  console.error('Uncaught Exception:', err);
});

process.on('unhandledRejection', (reason, promise) => {
  console.error('Unhandled Rejection at:', promise, 'reason:', reason);
});

module.exports = { io };
