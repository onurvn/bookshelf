import rateLimit from 'express-rate-limit';

// Genel rate limiting
export const generalLimiter = rateLimit({
    windowMs: 15 * 60 * 1000, // 15 dakika
    max: 100, // IP başına maksimum 100 request
    message: {
        success: false,
        message: 'Çok fazla istek gönderdiniz. Lütfen 15 dakika sonra tekrar deneyin.'
    },
    standardHeaders: true,
    legacyHeaders: false,
});

// Auth endpoint'leri için sıkı rate limiting
export const authLimiter = rateLimit({
    windowMs: 15 * 60 * 1000, // 15 dakika
    max: 5, // IP başına maksimum 5 login denemesi
    message: {
        success: false,
        message: 'Çok fazla giriş denemesi. Lütfen 15 dakika sonra tekrar deneyin.'
    },
    standardHeaders: true,
    legacyHeaders: false,
    skipSuccessfulRequests: true, // Başarılı istekleri sayma
});

// Kayıt için rate limiting
export const registerLimiter = rateLimit({
    windowMs: 60 * 60 * 1000, // 1 saat
    max: 3, // IP başına maksimum 3 kayıt
    message: {
        success: false,
        message: 'Çok fazla kayıt denemesi. Lütfen 1 saat sonra tekrar deneyin.'
    },
    standardHeaders: true,
    legacyHeaders: false,
});