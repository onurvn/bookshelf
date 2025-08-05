"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { apiUrl } from "@/lib/api";


interface Book {
  _id: string;
  title: string;
  author: string;
  description?: string;
  totalPages: number;
  currentPage: number;
  status: "want-to-read" | "reading" | "completed";
  rating?: number;
  progress: number;
}

interface User {
  _id: string;
  name: string;
  email: string;
}

export default function HomePage() {
  const router = useRouter();
  const [user, setUser] = useState<User | null>(null);
  const [books, setBooks] = useState<Book[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const token = localStorage.getItem("token");
    const userData = localStorage.getItem("user");

    if (!token || !userData) {
      router.push("/login");
      return;
    }

    setUser(JSON.parse(userData));
    fetchBooks();
  }, [router]);

  const fetchBooks = async () => {
    const token = localStorage.getItem("token");
    if (!token) return;

    try {
      const response = await fetch(apiUrl("/books"), {
        headers: {
          Authorization: `Bearer ${token}`,
          "Content-Type": "application/json",
        },
      });

      const data = await response.json();
      if (data.success) {
        setBooks(data.data.books);
      }
    } catch (error) {
      console.error("Books fetch error:", error);
    } finally {
      setLoading(false);
    }
  };

  const handleLogout = () => {
    localStorage.removeItem("token");
    localStorage.removeItem("user");
    router.push("/login");
  };

  const stats = {
    total: books.length,
    reading: books.filter((b) => b.status === "reading").length,
    completed: books.filter((b) => b.status === "completed").length,
    wantToRead: books.filter((b) => b.status === "want-to-read").length,
  };

  const recentBooks = books.slice(0, 6);

  if (loading) {
    return (
      <div className="loading-container">
        <div className="loading-spinner"></div>
        <h2 className="loading-text">Yükleniyor...</h2>
        <p className="loading-subtitle">Kütüphanen hazırlanıyor</p>
      </div>
    );
  }

  return (
    <div className="min-h-screen">
      {/* Header */}
      <header className="header">
        <div className="container">
          <div className="header-content">
            <div className="flex items-center gap-4">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 bg-black dark:bg-white rounded-lg flex items-center justify-center">
                  <svg
                    className="w-6 h-6 text-white dark:text-black"
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.747 0 3.332.477 4.5 1.253v13C19.832 18.477 18.247 18 16.5 18c-1.746 0-3.332.477-4.5 1.253"
                    />
                  </svg>
                </div>
                <div>
                  <h1 className="text-xl font-bold">Bookshelf</h1>
                  <p className="text-sm text-muted-foreground">Kitap Takip Uygulaması</p>
                </div>
              </div>
            </div>

            <div className="flex items-center gap-4">
              {user && (
                <div className="hidden md:flex items-center gap-3 card px-4 py-2">
                  <div className="w-8 h-8 bg-black dark:bg-white rounded-full flex items-center justify-center text-white dark:text-black font-bold text-sm">
                    {user.name.charAt(0).toUpperCase()}
                  </div>
                  <span className="font-medium">{user.name}</span>
                </div>
              )}

              <button onClick={handleLogout} className="btn btn-outline btn-sm">
                Çıkış
              </button>
            </div>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="container py-8">
        {/* Welcome Section */}
        <section className="text-center mb-12">
          <h2 className="text-4xl font-bold mb-4">
            Hoş geldin, {user?.name}! 👋
          </h2>
          <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
            Kitap okuma yolculuğundaki ilerlemeni takip et ve hedeflerine ulaş
          </p>
        </section>

        {/* Stats Cards */}
        <section className="mb-12">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            <div className="stats-card animate-fade-in">
              <div className="stats-value">{stats.total}</div>
              <div className="stats-label">Toplam Kitap</div>
            </div>
            <div className="stats-card animate-fade-in" style={{ animationDelay: '0.1s' }}>
              <div className="stats-value">{stats.reading}</div>
              <div className="stats-label">Şu An Okuyor</div>
            </div>
            <div className="stats-card animate-fade-in" style={{ animationDelay: '0.2s' }}>
              <div className="stats-value">{stats.completed}</div>
              <div className="stats-label">Tamamlandı</div>
            </div>
            <div className="stats-card animate-fade-in" style={{ animationDelay: '0.3s' }}>
              <div className="stats-value">{stats.wantToRead}</div>
              <div className="stats-label">Okuma Listesi</div>
            </div>
          </div>
        </section>

        {/* Recent Books */}
        <section className="mb-12">
          <div className="flex items-center justify-between mb-8">
            <h3 className="text-2xl font-bold">Son Kitaplar</h3>
            <Link href="/books/new" className="btn btn-primary">
              + Yeni Kitap Ekle
            </Link>
          </div>

          {recentBooks.length === 0 ? (
            <div className="empty-state">
              <div className="empty-icon">📚</div>
              <h4 className="empty-title">Henüz kitap eklenmemiş</h4>
              <p className="empty-description">
                İlk kitabını ekleyerek dijital kütüphaneni oluşturmaya başla!
              </p>
              <Link href="/books/new" className="btn btn-primary btn-lg">
                İlk Kitabını Ekle
              </Link>
            </div>
          ) : (
            <div className="grid-responsive">
              {recentBooks.map((book, index) => (
                <div key={book._id} className="book-card animate-fade-in" style={{ animationDelay: `${index * 0.1}s` }}>
                  <div className="flex justify-between items-start mb-4">
                    <div className="flex-1">
                      <h4 className="book-title line-clamp-2">{book.title}</h4>
                      <p className="book-author">{book.author}</p>
                    </div>
                    <span
                      className={`badge ${
                        book.status === "completed"
                          ? "badge-success"
                          : book.status === "reading"
                          ? "badge-warning"
                          : "badge-default"
                      }`}
                    >
                      {book.status === "completed"
                        ? "Tamamlandı"
                        : book.status === "reading"
                        ? "Okunuyor"
                        : "Okuma Listesi"}
                    </span>
                  </div>

                  {book.description && (
                    <p className="book-description line-clamp-2">{book.description}</p>
                  )}

                  {book.status === "reading" && (
                    <div className="book-progress">
                      <div className="progress-header">
                        <span className="progress-label">İlerleme</span>
                        <span className="progress-percentage">
                          %{Math.round(book.progress)}
                        </span>
                      </div>
                      <div className="progress">
                        <div
                          className="progress-bar"
                          style={{ width: `${book.progress}%` }}
                        ></div>
                      </div>
                      <p className="progress-pages">
                        {book.currentPage} / {book.totalPages} sayfa
                      </p>
                    </div>
                  )}

                  <div className="book-actions">
                    <Link
                      href={`/books/edit/${book._id}`}
                      className="btn btn-outline btn-sm"
                    >
                      Detaylar
                    </Link>
                  </div>
                </div>
              ))}
            </div>
          )}
        </section>

        {/* Quick Actions */}
        <section className="text-center">
          <div className="card p-8">
            <h3 className="text-2xl font-bold mb-4">Hızlı İşlemler</h3>
            <p className="text-muted-foreground mb-6">
              Kitaplarını yönet ve okuma deneyimini geliştir
            </p>
            <div className="flex flex-wrap justify-center gap-4">
              <Link href="/dashboard" className="btn btn-primary btn-lg">
                Tüm Kitapları Gör
              </Link>
              <Link href="/books/new" className="btn btn-secondary btn-lg">
                Yeni Kitap Ekle
              </Link>
            </div>
          </div>
        </section>
      </main>

      {/* Footer */}
      <footer className="border-t py-8 mt-16">
        <div className="container">
          <div className="text-center">
            <p className="text-sm text-muted-foreground">
              © 2025 Bookshelf. Tüm hakları saklıdır.
            </p>
          </div>
        </div>
      </footer>
    </div>
  );
}