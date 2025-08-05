import jwt from 'jsonwebtoken';
import User from '../models/User.js';

// Token blacklist (production'da Redis kullanın)
const tokenBlacklist = new Set();

export const authenticateToken = async (req, res, next) => {
  try {
    const authHeader = req.headers['authorization'];
    const token = authHeader && authHeader.split(' ')[1]; // Bearer TOKEN

    if (!token) {
      return res.status(401).json({ 
        success: false, 
        message: 'Erişim token\'ı gereklidir' 
      });
    }

    // Token blacklist kontrolü
    if (tokenBlacklist.has(token)) {
      return res.status(401).json({ 
        success: false, 
        message: 'Token geçersiz kılınmış' 
      });
    }

    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    const user = await User.findById(decoded.userId);

    if (!user) {
      return res.status(401).json({ 
        success: false, 
        message: 'Geçersiz token' 
      });
    }

    // Token'ın çok eski olup olmadığını kontrol et
    const tokenAge = Date.now() - (decoded.iat * 1000);
    const maxAge = 24 * 60 * 60 * 1000; // 24 saat
    
    if (tokenAge > maxAge) {
      return res.status(401).json({ 
        success: false, 
        message: 'Token süresi dolmuş, lütfen tekrar giriş yapın' 
      });
    }

    req.user = user;
    req.token = token;
    next();
  } catch (error) {
    if (error.name === 'TokenExpiredError') {
      return res.status(401).json({ 
        success: false, 
        message: 'Token süresi dolmuş' 
      });
    }
    if (error.name === 'JsonWebTokenError') {
      return res.status(403).json({ 
        success: false, 
        message: 'Geçersiz token formatı' 
      });
    }
    return res.status(403).json({ 
      success: false, 
      message: 'Token doğrulama hatası' 
    });
  }
};

// Token'ı blacklist'e ekle (logout için)
export const blacklistToken = (token) => {
  tokenBlacklist.add(token);
  
  // Token'ı 24 saat sonra blacklist'ten kaldır
  setTimeout(() => {
    tokenBlacklist.delete(token);
  }, 24 * 60 * 60 * 1000);
};