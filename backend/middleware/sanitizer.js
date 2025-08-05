import DOMPurify from 'isomorphic-dompurify';
import validator from 'validator';

// HTML/XSS temizleme middleware
export const sanitizeInput = (req, res, next) => {
    const sanitizeValue = (value) => {
        if (typeof value === 'string') {
            // HTML tag'lerini temizle
            value = DOMPurify.sanitize(value, { ALLOWED_TAGS: [] });
            // Script injection'ları temizle
            value = validator.escape(value);
            return value.trim();
        }
        if (typeof value === 'object' && value !== null) {
            for (const key in value) {
                value[key] = sanitizeValue(value[key]);
            }
        }
        return value;
    };

    // Request body'yi temizle
    if (req.body) {
        req.body = sanitizeValue(req.body);
    }

    // Query parameters'ı temizle
    if (req.query) {
        req.query = sanitizeValue(req.query);
    }

    next();
};

// SQL Injection koruması (NoSQL injection için)
export const preventNoSQLInjection = (req, res, next) => {
    const checkForInjection = (obj) => {
        if (typeof obj === 'object' && obj !== null) {
            for (const key in obj) {
                if (key.startsWith('$') || key.includes('.')) {
                    return true;
                }
                if (checkForInjection(obj[key])) {
                    return true;
                }
            }
        }
        return false;
    };

    if (checkForInjection(req.body) || checkForInjection(req.query)) {
        return res.status(400).json({
            success: false,
            message: 'Geçersiz karakter tespit edildi'
        });
    }

    next();
};