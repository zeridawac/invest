const Coin = require('../models/Coin');

const updateMarketPrices = async (io) => {
  try {
    const coins = await Coin.find({ isEnabled: true });
    
    for (let coin of coins) {
      // Small random fluctuation (-2% to +2%)
      const fluctuation = (Math.random() * 0.04) - 0.02;
      const oldPrice = coin.currentPrice;
      const newPrice = oldPrice * (1 + fluctuation);
      
      coin.priceHistory.push({ price: oldPrice, timestamp: new Date() });
      // Keep only last 50 points
      if (coin.priceHistory.length > 50) {
        coin.priceHistory.shift();
      }
      
      coin.currentPrice = parseFloat(newPrice.toFixed(2));
      await coin.save();
    }
    
    // Broadcast updated prices to all connected clients
    if (io) {
      const updatedCoins = await Coin.find({ isEnabled: true });
      io.emit('marketUpdate', updatedCoins);
    }
    
  } catch (err) {
    console.error('Market update error:', err);
  }
};

const startMarketSimulation = (io) => {
  // Update every 30 seconds for more "live" feel
  setInterval(() => updateMarketPrices(io), 30000);
};

module.exports = { startMarketSimulation };
