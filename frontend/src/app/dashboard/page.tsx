"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";

import { useToast } from "@/hooks/useToast";
import ConfirmModal from "@/components/ui/ConfirmModal";
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

export default function DashboardPage() {
  const router = useRouter();
  const toast = useToast();
  const [user, setUser] = useState<User | null>(null);
  const [books, setBooks] = useState<Book[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState<string>("");
  const [confirmModal, setConfirmModal] = useState<{
    isOpen: boolean;
    bookId: string;
    bookTitle: string;
  }>({
    isOpen: false,
    bookId: "",
    bookTitle: "",
  });

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

  const handleDeleteBook = (bookId: string, bookTitle: string) => {
    setConfirmModal({
      isOpen: true,
      bookId,
      bookTitle,
    });
  };

  const handleConfirmDelete = async () => {
    await performDeleteBook(confirmModal.bookId);
    setConfirmModal({ isOpen: false, bookId: "", bookTitle: "" });
  };

  const handleCancelDelete = () => {
    setConfirmModal({ isOpen: false, bookId: "", bookTitle: "" });
  };

  const performDeleteBook = async (bookId: string) => {
    const token = localStorage.getItem("token");
    if (!token) return;

    try {
      const response = await fetch(
        apiUrl(`/books/${bookId}`),
        {
          method: "DELETE",
          headers: {
            Authorization: `Bearer ${token}`,
            "Content-Type": "application/json",
          },
        }
      );

      const data = await response.json();
      if (data.success) {
        toast.success("Kitap başarıyla silindi!");
        fetchBooks();
      } else {
        toast.error(data.message || "Silme işlemi sırasında hata oluştu");
      }
    } catch (error) {
      console.error("Delete book error:", error);
      toast.error("Silme işlemi sırasında hata oluştu");
    }
  };

  const getStatusText = (status: string) => {
    const statusMap = {
      "want-to-read": "Okuma Listesi",
      reading: "Okunuyor",
      completed: "Tamamlandı",
    };
    return statusMap[status as keyof typeof statusMap] || status;
  };

  const filteredBooks = books.filter((book) => {
    const matchesSearch =
      book.title.toLowerCase().includes(search.toLowerCase()) ||
      book.author.toLowerCase().includes(search.toLowerCase());
    const matchesStatus = !statusFilter || book.status === statusFilter;
    return matchesSearch && matchesStatus;
  });

  const stats = {
    total: books.length,
    reading: books.filter((b) => b.status === "reading").length,
    completed: books.filter((b) => b.status === "completed").length,
    wantToRead: books.filter((b) => b.status === "want-to-read").length,
  };

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
              <Link href="/" className="flex items-center gap-3">
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
                <span className="font-bold text-xl">Bookshelf</span>
              </Link>
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

              <Link href="/books/new" className="btn btn-primary btn-sm">
                + Yeni Kitap
              </Link>
              <button onClick={handleLogout} className="btn btn-outline btn-sm">
                Çıkış
              </button>
            </div>
          </div>
        </div>
      </header>

      <main className="container py-8">
        {/* Stats */}
        <section className="mb-8">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            <div className="stats-card">
              <div className="stats-value">{stats.total}</div>
              <div className="stats-label">Toplam Kitap</div>
            </div>
            <div className="stats-card">
              <div className="stats-value">{stats.reading}</div>
              <div className="stats-label">Şu An Okuyor</div>
            </div>
            <div className="stats-card">
              <div className="stats-value">{stats.completed}</div>
              <div className="stats-label">Tamamlandı</div>
            </div>
            <div className="stats-card">
              <div className="stats-value">{stats.wantToRead}</div>
              <div className="stats-label">Okuma Listesi</div>
            </div>
          </div>
        </section>

        {/* Search and Filters */}
        <section className="mb-8">
          <div className="flex flex-col md:flex-row gap-4 items-center justify-between">
            <h1 className="text-3xl font-bold">Kitaplarım</h1>

            <div className="search-container">
              <input
                type="text"
                placeholder="Kitap ara..."
                className="search-input"
                value={search}
                onChange={(e) => setSearch(e.target.value)}
              />
              <svg
                className="search-icon w-4 h-4"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"
                />
              </svg>
            </div>
          </div>

          <div className="flex flex-wrap gap-2 mt-4">
            <button
              className={`filter-btn ${statusFilter === "" ? "active" : ""}`}
              onClick={() => setStatusFilter("")}
            >
              Tümü
            </button>
            <button
              className={`filter-btn ${
                statusFilter === "reading" ? "active" : ""
              }`}
              onClick={() => setStatusFilter("reading")}
            >
              Okunuyor
            </button>
            <button
              className={`filter-btn ${
                statusFilter === "completed" ? "active" : ""
              }`}
              onClick={() => setStatusFilter("completed")}
            >
              Tamamlandı
            </button>
            <button
              className={`filter-btn ${
                statusFilter === "want-to-read" ? "active" : ""
              }`}
              onClick={() => setStatusFilter("want-to-read")}
            >
              Okuma Listesi
            </button>
          </div>
        </section>

        {/* Books */}
        <section>
          {filteredBooks.length === 0 ? (
            <div className="empty-state">
              <div className="empty-icon">📚</div>
              <h3 className="empty-title">
                {search || statusFilter
                  ? "Arama sonucu bulunamadı"
                  : "Henüz kitap eklenmemiş"}
              </h3>
              <p className="empty-description">
                {search || statusFilter
                  ? "Farklı arama terimleri deneyin veya filtreleri temizleyin"
                  : "İlk kitabını ekleyerek dijital kütüphaneni oluşturmaya başla!"}
              </p>
              {!search && !statusFilter && (
                <Link href="/books/new" className="btn btn-primary btn-lg">
                  İlk Kitabını Ekle
                </Link>
              )}
            </div>
          ) : (
            <div className="grid-responsive">
              {filteredBooks.map((book, index) => (
                <div key={book._id} className="book-card">
                  <div className="flex justify-between items-start mb-4">
                    <div className="flex-1">
                      <h3 className="book-title line-clamp-2">{book.title}</h3>
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
                      {getStatusText(book.status)}
                    </span>
                  </div>

                  {book.description && (
                    <p className="book-description line-clamp-2">
                      {book.description}
                    </p>
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

                  {book.rating && (
                    <div className="flex items-center gap-1 mb-4">
                      <span className="text-sm text-muted-foreground">
                        Puanım:
                      </span>
                      <div className="flex">
                        {[...Array(5)].map((_, i) => (
                          <svg
                            key={i}
                            className={`w-4 h-4 ${
                              i < book.rating!
                                ? "text-yellow-400"
                                : "text-gray-300"
                            }`}
                            fill="currentColor"
                            viewBox="0 0 20 20"
                          >
                            <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
                          </svg>
                        ))}
                      </div>
                    </div>
                  )}

                  <div className="book-actions">
                    <Link
                      href={`/books/edit/${book._id}`}
                      className="btn btn-outline btn-sm"
                    >
                      Düzenle
                    </Link>
                    <button
                      onClick={() => handleDeleteBook(book._id, book.title)}
                      className="btn btn-destructive btn-sm"
                    >
                      Sil
                    </button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </section>
      </main>

      {/* Confirm Modal */}
      <ConfirmModal
        isOpen={confirmModal.isOpen}
        title="Kitabı Sil"
        message={`"${confirmModal.bookTitle}" kitabını silmek istediğinizden emin misiniz? Bu işlem geri alınamaz.`}
        confirmText="Sil"
        cancelText="İptal"
        onConfirm={handleConfirmDelete}
        onCancel={handleCancelDelete}
        type="danger"
      />
    </div>
  );
}
