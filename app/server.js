const express = require('express');
const path = require('path');
const { createProxyMiddleware } = require('http-proxy-middleware');

const app = express();
const PORT = process.env.PORT || 80;

// Enable CORS for all routes
app.use((req, res, next) => {
  res.header('Access-Control-Allow-Origin', '*');
  res.header('Access-Control-Allow-Methods', 'GET, POST, PUT, DELETE, OPTIONS');
  res.header('Access-Control-Allow-Headers', 'Origin, X-Requested-With, Content-Type, Accept, Authorization');
  
  if (req.method === 'OPTIONS') {
    res.sendStatus(200);
  } else {
    next();
  }
});

// Serve static files from dist directory
app.use(express.static(path.join(__dirname, 'dist/app')));

// API proxy middleware with CORS and updated endpoints
const userApiProxy = createProxyMiddleware({
  target: 'http://47.129.127.2:3005',
  changeOrigin: true,
  pathRewrite: {
    '^/api/users': '/api/users',
  },
  onProxyReq: (proxyReq, req, res) => {
    // Add CORS headers
    proxyReq.setHeader('Access-Control-Allow-Origin', '*');
  },
  onProxyRes: (proxyRes, req, res) => {
    // Add CORS headers to response
    proxyRes.headers['Access-Control-Allow-Origin'] = '*';
    proxyRes.headers['Access-Control-Allow-Methods'] = 'GET, POST, PUT, DELETE, OPTIONS';
    proxyRes.headers['Access-Control-Allow-Headers'] = 'Origin, X-Requested-With, Content-Type, Accept, Authorization';
  },
});

const bookingApiProxy = createProxyMiddleware({
  target: 'http://54.179.190.146:3002',
  changeOrigin: true,
  pathRewrite: {
    '^/api/bookings': '/api/bookings',
  },
  onProxyReq: (proxyReq, req, res) => {
    proxyReq.setHeader('Access-Control-Allow-Origin', '*');
  },
  onProxyRes: (proxyRes, req, res) => {
    proxyRes.headers['Access-Control-Allow-Origin'] = '*';
    proxyRes.headers['Access-Control-Allow-Methods'] = 'GET, POST, PUT, DELETE, OPTIONS';
    proxyRes.headers['Access-Control-Allow-Headers'] = 'Origin, X-Requested-With, Content-Type, Accept, Authorization';
  },
});

const reviewApiProxy = createProxyMiddleware({
  target: 'http://code-review-service:3003',
  changeOrigin: true,
  pathRewrite: {
    '^/api/reviews': '/api/reviews',
  },
  onProxyReq: (proxyReq, req, res) => {
    proxyReq.setHeader('Access-Control-Allow-Origin', '*');
  },
  onProxyRes: (proxyRes, req, res) => {
    proxyRes.headers['Access-Control-Allow-Origin'] = '*';
    proxyRes.headers['Access-Control-Allow-Methods'] = 'GET, POST, PUT, DELETE, OPTIONS';
    proxyRes.headers['Access-Control-Allow-Headers'] = 'Origin, X-Requested-With, Content-Type, Accept, Authorization';
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