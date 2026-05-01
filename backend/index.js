const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');
const dotenv = require('dotenv');
const http = require('http');
const { Server } = require('socket.io');

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

// Database Connection
mongoose.connect(process.env.MONGO_URI)
  .then(() => console.log('MongoDB Connected'))
  .catch(err => console.log('MongoDB Connection Error:', err));

// Socket.io
io.on('connection', (socket) => {
  console.log('User connected:', socket.id);
  socket.on('disconnect', () => {
    console.log('User disconnected');
  });
});

// Routes Placeholder
app.use('/api/auth', require('./routes/auth'));
app.use('/api/users', require('./routes/user'));
app.use('/api/coins', require('./routes/coin'));
app.use('/api/investments', require('./routes/investment'));
app.use('/api/games', require('./routes/game'));
app.use('/api/admin', require('./routes/admin'));
app.use('/api/withdrawals', require('./routes/withdrawal'));
app.use('/api/coupons', require('./routes/coupon'));

const { startMarketSimulation } = require('./utils/market');

const PORT = process.env.PORT || 5000;
server.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
  startMarketSimulation(io);
});

// Export io for use in other files
module.exports = { io };
