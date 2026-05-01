const axios = require('axios');

const testGames = async () => {
  const token = 'YOUR_AUTH_TOKEN_HERE'; // I don't have a token, but I can check if the routes are registered.
  const baseUrl = 'http://localhost:5000/api/games';

  console.log("Testing routes existence (expecting 401 if no token)...");
  
  const routes = ['/spin', '/tap', '/predict', '/scratch'];
  
  for (const route of routes) {
    try {
      await axios.post(`${baseUrl}${route}`);
    } catch (err) {
      console.log(`${route}: ${err.response?.status} ${err.response?.statusText}`);
    }
  }
};

testGames();
