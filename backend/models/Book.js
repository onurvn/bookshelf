import mongoose from 'mongoose';

const bookSchema = new mongoose.Schema({
  title: {
    type: String,
    required: [true, 'Kitap başlığı gereklidir'],
    trim: true,
    maxlength: [200, 'Başlık 200 karakterden uzun olamaz']
  },
  author: {
    type: String,
    required: [true, 'Yazar adı gereklidir'],
    trim: true,
    maxlength: [100, 'Yazar adı 100 karakterden uzun olamaz']
  },
  description: {
    type: String,
    trim: true,
    maxlength: [1000, 'Açıklama 1000 karakterden uzun olamaz']
  },
  totalPages: {
    type: Number,
    required: [true, 'Toplam sayfa sayısı gereklidir'],
    min: [1, 'Sayfa sayısı en az 1 olmalıdır']
  },
  currentPage: {
    type: Number,
    default: 0,
    min: [0, 'Mevcut sayfa negatif olamaz']
  },
  status: {
    type: String,
    enum: ['want-to-read', 'reading', 'completed'],
    default: 'want-to-read'
  },
  rating: {
    type: Number,
    min: [1, 'Puan en az 1 olmalıdır'],
    max: [5, 'Puan en fazla 5 olmalıdır']
  },
  review: {
    type: String,
    trim: true,
    maxlength: [500, 'Yorum 500 karakterden uzun olamaz']
  },
  coverImage: {
    type: String,
    default: ''
  },
  isbn: {
    type: String,
    trim: true
  },
  publishedYear: {
    type: Number,
    min: [1000, 'Geçerli bir yıl giriniz'],
    max: [new Date().getFullYear(), 'Gelecek yıl olamaz']
  },
  genre: {
    type: String,
    trim: true,
    maxlength: [50, 'Tür 50 karakterden uzun olamaz']
  },
  userId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  startDate: {
    type: Date
  },
  finishDate: {
    type: Date
  }
}, {
  timestamps: true
});

// Progress hesaplama
bookSchema.virtual('progress').get(function() {
  if (this.totalPages === 0) return 0;
  return Math.round((this.currentPage / this.totalPages) * 100);
});

// JSON'da virtual field'ları dahil et
bookSchema.set('toJSON', { virtuals: true });

// Index'ler
bookSchema.index({ userId: 1, status: 1 });
bookSchema.index({ userId: 1, title: 'text', author: 'text' });

export default mongoose.model('Book', bookSchema);