// server.js
const express = require('express');
require('dotenv').config();
const Binance = require('node-binance-api');

const app = express();
app.use(express.json());

const binance = new Binance().options({
  APIKEY: process.env.BINANCE_API_KEY,
  APISECRET: process.env.BINANCE_API_SECRET
});

let trading = false;

// Start trading endpoint
app.post('/start', async (req, res) => {
  trading = true;
  try {
    // Example: buy 0.001 BTC
    const response = await binance.marketBuy('BTCUSDT', 0.001);
    console.log('Trade executed:', response);
    res.json({ message: 'Trading started. Bought 0.001 BTC.' });
  } catch (err) {
    console.error('Trade error:', err);
    res.status(500).json({ message: 'Error executing trade' });
  }
});

// Stop trading endpoint
app.post('/stop', (req, res) => {
  trading = false;
  res.json({ message: 'Trading stopped.' });
});

// Run server
app.listen(3000, () => {
  console.log('Backend server running on http://localhost:3000');
});
