import express from 'express';
import { body, validationResult, query } from 'express-validator';
import Book from '../models/Book.js';
import { authenticateToken } from '../middleware/auth.js';

const router = express.Router();

// Tüm route'lar için authentication gerekli
router.use(authenticateToken);

// Kitapları listele (filtreleme ve arama ile)
router.get('/', [
  query('status').optional().isIn(['want-to-read', 'reading', 'completed']),
  query('search').optional().isString().trim(),
  query('page').optional().isInt({ min: 1 }),
  query('limit').optional().isInt({ min: 1, max: 100 })
], async (req, res) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({
        success: false,
        message: 'Geçersiz parametreler',
        errors: errors.array()
      });
    }

    const { status, search, page = 1, limit = 10 } = req.query;
    const skip = (page - 1) * limit;

    // Filtre oluştur
    const filter = { userId: req.user._id };
    if (status) filter.status = status;
    if (search) {
      filter.$or = [
        { title: { $regex: search, $options: 'i' } },
        { author: { $regex: search, $options: 'i' } }
      ];
    }

    // Kitapları getir
    const books = await Book.find(filter)
      .sort({ updatedAt: -1 })
      .skip(skip)
      .limit(parseInt(limit));

    const total = await Book.countDocuments(filter);

    res.json({
      success: true,
      data: {
        books,
        pagination: {
          current: parseInt(page),
          total: Math.ceil(total / limit),
          count: books.length,
          totalBooks: total
        }
      }
    });
  } catch (error) {
    console.error('Get books error:', error);
    res.status(500).json({
      success: false,
      message: 'Sunucu hatası'
    });
  }
});

// Tek kitap getir
router.get('/:id', async (req, res) => {
  try {
    const book = await Book.findOne({ 
      _id: req.params.id, 
      userId: req.user._id 
    });

    if (!book) {
      return res.status(404).json({
        success: false,
        message: 'Kitap bulunamadı'
      });
    }

    res.json({
      success: true,
      data: { book }
    });
  } catch (error) {
    console.error('Get book error:', error);
    res.status(500).json({
      success: false,
      message: 'Sunucu hatası'
    });
  }
});

// Yeni kitap ekle
router.post('/', [
  body('title').trim().isLength({ min: 1, max: 200 }).withMessage('Başlık 1-200 karakter arası olmalıdır'),
  body('author').trim().isLength({ min: 1, max: 100 }).withMessage('Yazar adı 1-100 karakter arası olmalıdır'),
  body('totalPages').isInt({ min: 1 }).withMessage('Toplam sayfa sayısı pozitif bir sayı olmalıdır'),
  body('description').optional().trim().isLength({ max: 1000 }).withMessage('Açıklama 1000 karakterden uzun olamaz'),
  body('status').optional().isIn(['want-to-read', 'reading', 'completed']),
  body('currentPage').optional().isInt({ min: 0 }),
  body('rating').optional().isInt({ min: 1, max: 5 }),
  body('review').optional().trim().isLength({ max: 500 }),
  body('genre').optional().trim().isLength({ max: 50 }),
  body('publishedYear').optional().isInt({ min: 1000, max: new Date().getFullYear() })
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

    const bookData = {
      ...req.body,
      userId: req.user._id
    };

    // Eğer kitap tamamlandıysa ve bitiş tarihi yoksa bugünü ekle
    if (bookData.status === 'completed' && !bookData.finishDate) {
      bookData.finishDate = new Date();
    }

    // Eğer kitap okunmaya başlandıysa ve başlangıç tarihi yoksa bugünü ekle
    if (bookData.status === 'reading' && !bookData.startDate) {
      bookData.startDate = new Date();
    }

    const book = new Book(bookData);
    await book.save();

    res.status(201).json({
      success: true,
      message: 'Kitap başarıyla eklendi',
      data: { book }
    });
  } catch (error) {
    console.error('Create book error:', error);
    res.status(500).json({
      success: false,
      message: 'Sunucu hatası'
    });
  }
});

// Kitap güncelle
router.put('/:id', [
  body('title').optional().trim().isLength({ min: 1, max: 200 }),
  body('author').optional().trim().isLength({ min: 1, max: 100 }),
  body('totalPages').optional().isInt({ min: 1 }),
  body('description').optional().trim().isLength({ max: 1000 }),
  body('status').optional().isIn(['want-to-read', 'reading', 'completed']),
  body('currentPage').optional().isInt({ min: 0 }),
  body('rating').optional().isInt({ min: 1, max: 5 }),
  body('review').optional().trim().isLength({ max: 500 }),
  body('genre').optional().trim().isLength({ max: 50 }),
  body('publishedYear').optional().isInt({ min: 1000, max: new Date().getFullYear() })
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

    const book = await Book.findOne({ 
      _id: req.params.id, 
      userId: req.user._id 
    });

    if (!book) {
      return res.status(404).json({
        success: false,
        message: 'Kitap bulunamadı'
      });
    }

    // Durum değişikliklerini takip et
    const oldStatus = book.status;
    const newStatus = req.body.status;

    // Güncelleme verilerini uygula
    Object.assign(book, req.body);

    // Durum değişikliklerine göre tarihleri güncelle
    if (oldStatus !== newStatus) {
      if (newStatus === 'reading' && !book.startDate) {
        book.startDate = new Date();
      }
      if (newStatus === 'completed' && !book.finishDate) {
        book.finishDate = new Date();
      }
      if (newStatus === 'want-to-read') {
        book.startDate = undefined;
        book.finishDate = undefined;
        book.currentPage = 0;
      }
    }

    await book.save();

    res.json({
      success: true,
      message: 'Kitap başarıyla güncellendi',
      data: { book }
    });
  } catch (error) {
    console.error('Update book error:', error);
    res.status(500).json({
      success: false,
      message: 'Sunucu hatası'
    });
  }
});

// Kitap sil
router.delete('/:id', async (req, res) => {
  try {
    const book = await Book.findOneAndDelete({ 
      _id: req.params.id, 
      userId: req.user._id 
    });

    if (!book) {
      return res.status(404).json({
        success: false,
        message: 'Kitap bulunamadı'
      });
    }

    res.json({
      success: true,
      message: 'Kitap başarıyla silindi'
    });
  } catch (error) {
    console.error('Delete book error:', error);
    res.status(500).json({
      success: false,
      message: 'Sunucu hatası'
    });
  }
});

// İstatistikler
router.get('/stats/dashboard', async (req, res) => {
  try {
    const userId = req.user._id;

    const stats = await Book.aggregate([
      { $match: { userId } },
      {
        $group: {
          _id: '$status',
          count: { $sum: 1 },
          totalPages: { $sum: '$totalPages' },
          readPages: { $sum: '$currentPage' }
        }
      }
    ]);

    const totalBooks = await Book.countDocuments({ userId });
    const avgRating = await Book.aggregate([
      { $match: { userId, rating: { $exists: true } } },
      { $group: { _id: null, avgRating: { $avg: '$rating' } } }
    ]);

    const recentBooks = await Book.find({ userId })
      .sort({ updatedAt: -1 })
      .limit(5)
      .select('title author status updatedAt');

    res.json({
      success: true,
      data: {
        totalBooks,
        stats: stats.reduce((acc, stat) => {
          acc[stat._id] = {
            count: stat.count,
            totalPages: stat.totalPages,
            readPages: stat.readPages
          };
          return acc;
        }, {}),
        averageRating: avgRating[0]?.avgRating || 0,
        recentBooks
      }
    });
  } catch (error) {
    console.error('Stats error:', error);
    res.status(500).json({
      success: false,
      message: 'Sunucu hatası'
    });
  }
});

export default router;