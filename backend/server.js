import express from 'express';
import cors from 'cors';
import dotenv from 'dotenv';
import mongoose from 'mongoose';

// Routes
import authRoutes from './routes/auth.js';
import bookRoutes from './routes/books.js';

dotenv.config();

const app = express();
const PORT = process.env.PORT || 5000;

// Performance middleware
app.set('trust proxy', 1);

// CORS configuration
const corsOptions = {
  origin: process.env.NODE_ENV === 'production' 
    ? process.env.FRONTEND_URL 
    : ['http://localhost:3000', 'http://127.0.0.1:3000'],
  credentials: true,
  optionsSuccessStatus: 200
};

// Middleware
app.use(cors(corsOptions));
app.use(express.json({ 
  limit: '1mb',
  strict: true
}));
app.use(express.urlencoded({ 
  extended: true,
  limit: '1mb'
}));

// Security headers
app.use((_, res, next) => {
  res.setHeader('X-Content-Type-Options', 'nosniff');
  res.setHeader('X-Frame-Options', 'DENY');
  res.setHeader('X-XSS-Protection', '1; mode=block');
  next();
});

// Routes
app.use('/api/auth', authRoutes);
app.use('/api/books', bookRoutes);

// Health check
app.get('/api/health', (_, res) => {
  res.json({
    message: 'Bookshelf API is running!',
    timestamp: new Date().toISOString(),
    environment: process.env.NODE_ENV || 'development'
  });
});

// 404 handler
app.use('*', (_, res) => {
  res.status(404).json({
    success: false,
    message: 'Endpoint bulunamadı'
  });
});

// Global error handler
app.use((error, _, res, __) => {
  console.error('Global error:', error);
  res.status(500).json({
    success: false,
    message: 'Sunucu hatası',
    ...(process.env.NODE_ENV === 'development' && { error: error.message })
  });
});

// MongoDB Connection with optimizations
const mongoOptions = {
  maxPoolSize: 10,
  serverSelectionTimeoutMS: 5000,
  socketTimeoutMS: 45000,
};

mongoose.connect(process.env.MONGODB_URI || 'mongodb://localhost:27017/bookshelf', mongoOptions)
  .then(() => {
    console.log('✅ MongoDB bağlantısı başarılı');
    console.log(`📍 Database: ${mongoose.connection.name}`);

    app.listen(PORT, () => {
      console.log(`🚀 Server ${PORT} portunda çalışıyor`);
      console.log(`📍 Health check: http://localhost:${PORT}/api/health`);
      console.log(`📍 Environment: ${process.env.NODE_ENV || 'development'}`);
    });
  })
  .catch((error) => {
    console.error('❌ MongoDB bağlantı hatası:', error);
    process.exit(1);
  });

// Graceful shutdown
process.on('SIGINT', async () => {
  console.log('\n🔄 Sunucu kapatılıyor...');
  await mongoose.connection.close();
  console.log('✅ MongoDB bağlantısı kapatıldı');
  process.exit(0);
});