const express = require('express');
const path = require('path');
const { createProxyMiddleware } = require('http-proxy-middleware');

const app = express();
const PORT = process.env.PORT || 80;

// Serve static files from dist directory
app.use(express.static(path.join(__dirname, 'dist/app')));

// API proxy middleware
const userApiProxy = createProxyMiddleware({
  target: 'http://user-service:3005',
  changeOrigin: true,
  pathRewrite: {
    '^/api/users': '',
  },
});

const bookingApiProxy = createProxyMiddleware({
  target: 'http://booking-service:3002',
  changeOrigin: true,
  pathRewrite: {
    '^/api/bookings': '',
  },
});

const reviewApiProxy = createProxyMiddleware({
  target: 'http://code-review-service:3003',
  changeOrigin: true,
  pathRewrite: {
    '^/api/reviews': '',
  },
});

// Apply proxy middleware
app.use('/api/users', userApiProxy);
app.use('/api/bookings', bookingApiProxy);
app.use('/api/reviews', reviewApiProxy);

// Health check endpoint
app.get('/health', (req, res) => {
  res.status(200).send('healthy');
});

// Handle Angular routing - serve index.html for all non-API routes
app.get('*', (req, res) => {
  res.sendFile(path.join(__dirname, 'dist/app/index.html'));
});

app.listen(PORT, () => {
  console.log(`Frontend server running on port ${PORT}`);
});