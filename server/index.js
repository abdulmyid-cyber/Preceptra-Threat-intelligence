const express = require('express');
const cors = require('cors');
const dotenv = require('dotenv');
const path = require('path');

dotenv.config();

const app = express();
const PORT = process.env.PORT || 5000;

// Middleware
app.use(cors());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Initialize database
const db = require('./database/db');
db.init().catch(err => {
  console.error('Failed to initialize database:', err);
  process.exit(1);
});

// Routes
app.use('/api/auth', require('./routes/auth'));
app.use('/api/feeds', require('./routes/feeds'));
app.use('/api/iocs', require('./routes/iocs'));
app.use('/api/llm', require('./routes/llm'));
app.use('/api/taxii', require('./routes/taxii'));
app.use('/api/news', require('./routes/news'));
app.use('/api/users', require('./routes/users'));

// TAXII 2.1 Server endpoints
app.use('/taxii2', require('./taxii/server'));

// Serve static files from React app in production
if (process.env.NODE_ENV === 'production') {
  app.use(express.static(path.join(__dirname, '../client/dist')));
  app.get('*', (req, res) => {
    res.sendFile(path.join(__dirname, '../client/dist/index.html'));
  });
}

// Root route
app.get('/', (req, res) => {
  res.json({
    service: 'PRECEPTRA Threat Intelligence Platform',
    version: '1.0.0',
    status: 'running',
    endpoints: {
      health: '/api/health',
      auth: '/api/auth',
      feeds: '/api/feeds',
      iocs: '/api/iocs',
      llm: '/api/llm',
      taxii: '/api/taxii',
      taxiiServer: '/taxii2/'
    },
    frontend: process.env.CLIENT_URL || 'http://localhost:5173'
  });
});

// Health check
app.get('/api/health', (req, res) => {
  res.json({ status: 'ok', service: 'PRECEPTRA Threat Intelligence Platform' });
});

app.listen(PORT, () => {
  console.log(`🚀 PRECEPTRA Threat Intelligence Platform running on port ${PORT}`);
  console.log(`📊 Dashboard: http://localhost:${PORT}`);
  console.log(`🔌 TAXII Server: http://localhost:${PORT}/taxii2/`);
});

