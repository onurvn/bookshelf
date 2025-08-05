# 📚 Bookshelf - Kitap Takip Uygulaması

Modern, kullanıcı dostu kitap takip uygulaması. Okudukların, okumakta oldukların ve okumak istediklerin kitapları kolayca takip et!

## 🚀 Özellikler

- ✅ Kullanıcı kayıt/giriş sistemi
- 📖 Kitap ekleme, düzenleme, silme
- 📊 Okuma ilerleme takibi
- ⭐ Puanlama ve yorum sistemi
- 🔍 Arama ve filtreleme
- 📱 Responsive tasarım (mobil + desktop)
- 📈 Okuma istatistikleri dashboard'u

## 🛠️ Teknolojiler

### Frontend

- Next.js 14 (App Router)
- TypeScript
- Tailwind CSS
- Zustand (State Management)
- React Hook Form
- React Hot Toast
- React Icons

### Backend

- Node.js
- Express.js
- MongoDB + Mongoose
- JWT Authentication
- Bcrypt.js

## 🏃‍♂️ Hızlı Başlangıç

### Gereksinimler

- Node.js (v18 veya üzeri)
- MongoDB (yerel kurulum veya MongoDB Atlas)

### Kurulum

1. **Tüm bağımlılıkları yükle:**

```bash
npm run install:all
```

2. **MongoDB'yi başlat:**

```bash
# Yerel MongoDB
mongod

# Veya MongoDB Atlas kullanıyorsanız connection string'i backend/.env dosyasında güncelleyin
```

3. **Backend environment dosyasını düzenle:**

```bash
# backend/.env dosyasını açın ve gerekli ayarları yapın
MONGODB_URI=mongodb://localhost:27017/bookshelf
JWT_SECRET=your-super-secret-jwt-key-change-this-in-production
```

4. **Geliştirme sunucularını başlat:**

```bash
npm run dev
```

🌐 **Frontend:** http://localhost:3000  
🔧 **Backend API:** http://localhost:5000

## 📋 API Endpoints

### Authentication

- `POST /api/auth/register` - Kullanıcı kaydı
- `POST /api/auth/login` - Kullanıcı girişi
- `GET /api/auth/profile` - Kullanıcı profili

### Books

- `GET /api/books` - Kitapları listele (filtreleme ve arama)
- `GET /api/books/:id` - Tek kitap detayı
- `POST /api/books` - Yeni kitap ekle
- `PUT /api/books/:id` - Kitap güncelle
- `DELETE /api/books/:id` - Kitap sil
- `GET /api/books/stats/dashboard` - Dashboard istatistikleri

## 🎯 Kullanım

1. **Kayıt/Giriş:** Uygulamaya kayıt olun veya giriş yapın
2. **Dashboard:** Ana sayfada kitap istatistiklerinizi görün
3. **Kitap Ekle:** "Kitap Ekle" butonuyla yeni kitaplar ekleyin
4. **Takip:** Kitaplarınızın okuma durumunu ve ilerlemesini takip edin
5. **Arama/Filtre:** Kitaplarınızı arayın ve duruma göre filtreleyin

## 📁 Proje Yapısı

```
bookshelf-app/
├── frontend/              # Next.js uygulaması
│   ├── src/
│   │   ├── app/          # App Router sayfaları
│   │   ├── lib/          # Utility fonksiyonları
│   │   └── store/        # Zustand store'ları
│   ├── public/           # Statik dosyalar
│   └── package.json
├── backend/               # Express.js API
│   ├── models/           # MongoDB modelleri
│   ├── routes/           # API route'ları
│   ├── middleware/       # Express middleware'leri
│   ├── server.js         # Ana sunucu dosyası
│   └── package.json
├── package.json          # Root package.json
└── README.md
```

## 🔧 Geliştirme

### Frontend Geliştirme

```bash
cd frontend
npm run dev
```

### Backend Geliştirme

```bash
cd backend
npm run dev
```

### Veritabanı Şeması

**Users Collection:**

- name, email, password, avatar, timestamps

**Books Collection:**

- title, author, description, totalPages, currentPage
- status, rating, review, coverImage, isbn
- publishedYear, genre, userId, startDate, finishDate
- timestamps, virtual progress field

## 🚀 Deployment

### Frontend (Vercel)

```bash
cd frontend
npm run build
# Vercel'e deploy edin
```

### Backend (Railway/Render/Heroku)

```bash
cd backend
# Environment variables'ları ayarlayın
# MongoDB Atlas connection string
# JWT_SECRET
```

## 🤝 Katkıda Bulunma

1. Fork edin
2. Feature branch oluşturun (`git checkout -b feature/amazing-feature`)
3. Commit edin (`git commit -m 'Add amazing feature'`)
4. Push edin (`git push origin feature/amazing-feature`)
5. Pull Request açın

## 📄 Lisans

Bu proje MIT lisansı altında lisanslanmıştır.

---

**Bookshelf** ile kitap okuma yolculuğunuzu keyifle takip edin! 📚✨
