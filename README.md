# 📚 Bookshelf - Book Tracking Application

Modern and user-friendly book tracking application. Easily manage the books you've read, are currently reading, and want to read!

## ✨ Features

- 🔐 Secure user registration/login system
- 📖 Add, edit, and delete books
- 📊 Reading progress tracking
- ⭐ Book rating and review system
- 🔍 Advanced search and filtering
- 📱 Responsive design (mobile-friendly)
- 📈 Personal reading statistics

## 🛠️ Tech Stack

### Frontend

- **Next.js 15** - React framework (App Router)
- **TypeScript** - Type safety
- **Tailwind CSS** - Styling
- **React Hot Toast** - Notifications

### Backend

- **Node.js** - Runtime environment
- **Express.js** - Web framework
- **MongoDB** - Database
- **Mongoose** - ODM
- **JWT** - Authentication
- **bcryptjs** - Password hashing

## 🚀 Installation and Setup

### Requirements

- Node.js (v18+)
- MongoDB (local or Atlas)
- npm or yarn

### 1. Clone the repository

```bash
git clone <repository-url>
cd bookshelf-app
```

### 2. Install all dependencies

```bash
npm run install:all
```

### 3. Backend configuration

```bash
# Create backend/.env file (copy from .env.example)
cp backend/.env.example backend/.env

# Edit the .env file:
MONGODB_URI=mongodb://localhost:27017/bookshelf
JWT_SECRET=your-super-secret-jwt-key-64-characters-long
PORT=5000
NODE_ENV=development
FRONTEND_URL=http://localhost:3000
```

### 4. Start development servers

```bash
npm run dev
```

- 🌐 **Frontend:** http://localhost:3000
- 🔧 **Backend API:** http://localhost:5000

## 📋 API Endpoints

### Authentication

```
POST /api/auth/register    # User registration
POST /api/auth/login       # User login
GET  /api/auth/profile     # User profile
```

### Books

```
GET    /api/books          # List books
GET    /api/books/:id      # Book details
POST   /api/books          # Add new book
PUT    /api/books/:id      # Update book
DELETE /api/books/:id      # Delete book
GET    /api/books/stats    # Statistics
```

## 📁 Project Structure

```
bookshelf-app/
├── frontend/                 # Next.js application
│   ├── src/
│   │   ├── app/             # App Router pages
│   │   └── lib/             # Utility functions
│   ├── public/              # Static files
│   └── package.json
├── backend/                  # Express.js API
│   ├── models/              # MongoDB models
│   ├── routes/              # API routes
│   ├── middleware/          # Express middleware
│   ├── server.js            # Main server
│   └── package.json
└── package.json             # Root scripts
```

## 🔧 Development Commands

```bash
# Run all services
npm run dev

# Frontend only
npm run dev:frontend

# Backend only
npm run dev:backend

# Production build
npm run build

# Linting
npm run lint

# Type checking
npm run type-check
```

## 🚀 Deployment

### Frontend (Vercel)

1. Connect to your Vercel account
2. Deploy the `frontend` folder
3. Set environment variables

### Backend (Railway/Render)

1. MongoDB Atlas connection string
2. Environment variables:
   ```
   MONGODB_URI=mongodb+srv://...
   JWT_SECRET=your-production-secret
   NODE_ENV=production
   FRONTEND_URL=https://your-app.vercel.app
   ```

## 🤝 Contributing

1. Fork the project
2. Create a feature branch (`git checkout -b feature/new-feature`)
3. Commit your changes (`git commit -m 'Add new feature'`)
4. Push to the branch (`git push origin feature/new-feature`)
5. Create a Pull Request

## 📄 License

This project is licensed under the MIT License.

---

Take your reading experience to the next level with **Bookshelf**! �✨