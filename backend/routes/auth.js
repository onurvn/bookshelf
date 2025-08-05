import express from 'express';
import jwt from 'jsonwebtoken';
import { body, validationResult } from 'express-validator';
import User from '../models/User.js';
import { authenticateToken } from '../middleware/auth.js';

const router = express.Router();

// JWT token oluştur (daha kısa süre)
const generateToken = (userId) => {
  return jwt.sign(
    { 
      userId,
      iat: Math.floor(Date.now() / 1000),
      type: 'access'
    }, 
    process.env.JWT_SECRET, 
    { expiresIn: '24h' } // 7 gün yerine 24 saat
  );
};

// Kullanıcı kaydı
router.post('/register', [
  body('name').trim().isLength({ min: 2, max: 50 }).withMessage('İsim 2-50 karakter arası olmalıdır'),
  body('email').isEmail().normalizeEmail().withMessage('Geçerli bir email adresi giriniz'),
  body('password').isLength({ min: 6 }).withMessage('Şifre en az 6 karakter olmalıdır')
], async (req, res) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({
        success: false,
        message: 'Geçersiz veriler',
        errors: errors.array()
      });
    }

    const { name, email, password } = req.body;

    // Email kontrolü
    const existingUser = await User.findOne({ email });
    if (existingUser) {
      return res.status(400).json({
        success: false,
        message: 'Bu email adresi zaten kullanılıyor'
      });
    }

    // Yeni kullanıcı oluştur
    const user = new User({ name, email, password });
    await user.save();

    // Token oluştur
    const token = generateToken(user._id);

    res.status(201).json({
      success: true,
      message: 'Kullanıcı başarıyla oluşturuldu',
      data: {
        user,
        token
      }
    });
  } catch (error) {
    console.error('Register error:', error);
    res.status(500).json({
      success: false,
      message: 'Sunucu hatası'
    });
  }
});

// Kullanıcı girişi
router.post('/login', [
  body('email').isEmail().normalizeEmail().withMessage('Geçerli bir email adresi giriniz'),
  body('password').notEmpty().withMessage('Şifre gereklidir')
], async (req, res) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({
        success: false,
        message: 'Geçersiz veriler',
        errors: errors.array()
      });
    }

    const { email, password } = req.body;

    // Kullanıcıyı bul
    const user = await User.findOne({ email });
    if (!user) {
      return res.status(401).json({
        success: false,
        message: 'Geçersiz email veya şifre'
      });
    }

    // Şifre kontrolü
    const isPasswordValid = await user.comparePassword(password);
    if (!isPasswordValid) {
      return res.status(401).json({
        success: false,
        message: 'Geçersiz email veya şifre'
      });
    }

    // Token oluştur
    const token = generateToken(user._id);

    res.json({
      success: true,
      message: 'Giriş başarılı',
      data: {
        user,
        token
      }
    });
  } catch (error) {
    console.error('Login error:', error);
    res.status(500).json({
      success: false,
      message: 'Sunucu hatası'
    });
  }
});

// Kullanıcı profili
router.get('/profile', authenticateToken, async (req, res) => {
  try {
    res.json({
      success: true,
      data: {
        user: req.user
      }
    });
  } catch (error) {
    console.error('Profile error:', error);
    res.status(500).json({
      success: false,
      message: 'Sunucu hatası'
    });
  }
});

// Logout endpoint
router.post('/logout', authenticateToken, async (req, res) => {
  try {
    // Token'ı blacklist'e ekle
    const { blacklistToken } = await import('../middleware/auth.js');
    blacklistToken(req.token);
    
    res.json({
      success: true,
      message: 'Başarıyla çıkış yapıldı'
    });
  } catch (error) {
    console.error('Logout error:', error);
    res.status(500).json({
      success: false,
      message: 'Sunucu hatası'
    });
  }
});

export default router;