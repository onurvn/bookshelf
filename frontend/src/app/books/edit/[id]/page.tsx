"use client";

import { useEffect, useState, useCallback } from "react";
import { useRouter, useParams } from "next/navigation";
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
  review?: string;
  genre?: string;
  publishedYear?: number;
  progress: number;
}

export default function EditBookPage() {
  const router = useRouter();
  const params = useParams();
  const bookId = params.id as string;
  const toast = useToast();

  const [book, setBook] = useState<Book | null>(null);
  const [loading, setLoading] = useState(false);
  const [saving, setSaving] = useState(false);
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [formData, setFormData] = useState(() => ({
    title: "",
    author: "",
    description: "",
    totalPages: "",
    currentPage: "",
    status: "want-to-read" as "want-to-read" | "reading" | "completed",
    rating: "",
    review: "",
    genre: "",
    publishedYear: "",
  }));

  // Form data'yı kitap yüklendiğinde güncelle - SADECE BİR KEZ
  useEffect(() => {
    if (book && !formData.title) {
      setFormData({
        title: book.title || "",
        author: book.author || "",
        description: book.description || "",
        totalPages: book.totalPages?.toString() || "",
        currentPage: book.currentPage?.toString() || "",
        status: book.status || ("want-to-read" as const),
        rating: book.rating?.toString() || "",
        review: book.review || "",
        genre: book.genre || "",
        publishedYear: book.publishedYear?.toString() || "",
      });
    }
  }, [book]);

  const fetchBook = useCallback(async () => {
    const token = localStorage.getItem("token");
    if (!token) return;

    try {
      const response = await fetch(
        apiUrl(`/books/${bookId}`),
        {
          headers: {
            Authorization: `Bearer ${token}`,
            "Content-Type": "application/json",
          },
        }
      );

      const data = await response.json();
      if (data.success) {
        const bookData = data.data.book;
        setBook(bookData);
      } else {
        toast.error("Kitap bulunamadı");
        router.push("/dashboard");
      }
    } catch (error) {
      console.error("Fetch book error:", error);
      toast.error("Kitap yüklenirken hata oluştu");
      router.push("/dashboard");
    } finally {
      setLoading(false);
    }
  }, [bookId]); // router ve toast dependency'lerini kaldırdık

  useEffect(() => {
    if (typeof window === "undefined") return;

    const token = localStorage.getItem("token");
    if (!token) {
      router.push("/login");
      return;
    }

    // Sadece bir kez çalışsın
    if (!book && !loading) {
      setLoading(true);
      fetchBook();
    }
  }, [book, bookId, fetchBook, loading, router]); // Sadece bookId dependency'si

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaving(true);

    const token = localStorage.getItem("token");
    if (!token) {
      router.push("/login");
      return;
    }

    try {
      const submitData = {
        title: formData.title.trim(),
        author: formData.author.trim(),
        description: formData.description.trim(),
        totalPages: parseInt(formData.totalPages),
        currentPage: parseInt(formData.currentPage) || 0,
        status: formData.status,
        ...(formData.rating && { rating: parseInt(formData.rating) }),
        ...(formData.review.trim() && { review: formData.review.trim() }),
        ...(formData.genre.trim() && { genre: formData.genre.trim() }),
        ...(formData.publishedYear && {
          publishedYear: parseInt(formData.publishedYear),
        }),
      };

      const response = await fetch(
        apiUrl(`/books/${bookId}`),
        {
          method: "PUT",
          headers: {
            Authorization: `Bearer ${token}`,
            "Content-Type": "application/json",
          },
          body: JSON.stringify(submitData),
        }
      );

      const data = await response.json();

      if (data.success) {
        toast.success("Kitap başarıyla güncellendi!");
        router.push("/dashboard");
      } else {
        toast.error(data.message || "Güncelleme sırasında hata oluştu");
      }
    } catch (error) {
      console.error("Update error:", error);
      toast.error("Güncelleme sırasında hata oluştu");
    } finally {
      setSaving(false);
    }
  };

  const handleInputChange = (
    e: React.ChangeEvent<
      HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement
    >
  ) => {
    const { name, value } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  const handleDeleteBook = () => {
    setShowDeleteModal(true);
  };

  const handleConfirmDelete = async () => {
    await performDeleteBook();
    setShowDeleteModal(false);
  };

  const handleCancelDelete = () => {
    setShowDeleteModal(false);
  };

  const performDeleteBook = async () => {
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
        router.push("/dashboard");
      } else {
        toast.error(data.message || "Silme işlemi sırasında hata oluştu");
      }
    } catch (error) {
      console.error("Delete book error:", error);
      toast.error("Silme işlemi sırasında hata oluştu");
    }
  };

  const progress =
    formData.totalPages && formData.currentPage
      ? Math.round(
          (Number(formData.currentPage) / Number(formData.totalPages)) * 100
        )
      : 0;

  if (loading) {
    return (
      <div className="loading-container">
        <div className="loading-spinner"></div>
        <h2 className="loading-text">Yükleniyor...</h2>
        <p className="loading-subtitle">Kitap bilgileri getiriliyor</p>
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
              <Link href="/dashboard" className="btn btn-ghost">
                <svg
                  className="h-4 w-4"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M15 19l-7-7 7-7"
                  />
                </svg>
                Geri
              </Link>
              <h1 className="text-xl font-bold">Kitap Düzenle</h1>
            </div>
          </div>
        </div>
      </header>

      <div className="container py-8">
        <div className="max-w-2xl mx-auto">
          <div className="card p-6">
            <div className="text-center mb-6">
              <h2 className="text-2xl font-bold mb-2">
                Kitap Bilgilerini Düzenle
              </h2>
              <p className="text-muted-foreground">
                Kitap bilgilerini güncelleyebilir, ilerleme durumunu
                değiştirebilirsin
              </p>
            </div>
            <form onSubmit={handleSubmit} className="space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {/* Kitap Başlığı */}
                <div>
                  <label className="block text-sm font-medium mb-2">
                    Kitap Başlığı *
                  </label>
                  <input
                    type="text"
                    name="title"
                    value={formData.title}
                    onChange={handleInputChange}
                    className="input"
                    placeholder="Kitap başlığını girin..."
                    required
                  />
                </div>

                {/* Yazar */}
                <div>
                  <label className="block text-sm font-medium mb-2">
                    Yazar *
                  </label>
                  <input
                    type="text"
                    name="author"
                    value={formData.author}
                    onChange={handleInputChange}
                    className="input"
                    placeholder="Yazar adını girin..."
                    required
                  />
                </div>

                {/* Toplam Sayfa */}
                <div>
                  <label className="block text-sm font-medium mb-2">
                    Toplam Sayfa *
                  </label>
                  <input
                    type="number"
                    name="totalPages"
                    value={formData.totalPages}
                    onChange={handleInputChange}
                    className="input"
                    placeholder="Toplam sayfa sayısı..."
                    min="1"
                    required
                  />
                </div>

                {/* Mevcut Sayfa */}
                <div>
                  <label className="block text-sm font-medium mb-2">
                    Mevcut Sayfa
                  </label>
                  <input
                    type="number"
                    name="currentPage"
                    value={formData.currentPage}
                    onChange={handleInputChange}
                    className="input"
                    placeholder="Kaçıncı sayfadasın..."
                    min="0"
                    max={formData.totalPages || undefined}
                  />
                </div>

                {/* Durum */}
                <div>
                  <label className="block text-sm font-medium mb-2">
                    Okuma Durumu
                  </label>
                  <select
                    name="status"
                    value={formData.status}
                    onChange={handleInputChange}
                    className="input"
                  >
                    <option value="want-to-read">Okunacak</option>
                    <option value="reading">Okunuyor</option>
                    <option value="completed">Tamamlandı</option>
                  </select>
                </div>

                {/* Puan */}
                <div>
                  <label className="block text-sm font-medium mb-2">
                    Puan (1-5)
                  </label>
                  <select
                    name="rating"
                    value={formData.rating}
                    onChange={handleInputChange}
                    className="input"
                  >
                    <option value="">Puan seçin...</option>
                    <option value="1">⭐ 1 - Kötü</option>
                    <option value="2">⭐⭐ 2 - Fena değil</option>
                    <option value="3">⭐⭐⭐ 3 - İyi</option>
                    <option value="4">⭐⭐⭐⭐ 4 - Çok iyi</option>
                    <option value="5">⭐⭐⭐⭐⭐ 5 - Mükemmel</option>
                  </select>
                </div>

                {/* Tür */}
                <div>
                  <label className="block text-sm font-medium mb-2">Tür</label>
                  <input
                    type="text"
                    name="genre"
                    value={formData.genre}
                    onChange={handleInputChange}
                    className="input"
                    placeholder="Roman, Bilim Kurgu, Tarih..."
                  />
                </div>

                {/* Yayın Yılı */}
                <div>
                  <label className="block text-sm font-medium mb-2">
                    Yayın Yılı
                  </label>
                  <input
                    type="number"
                    name="publishedYear"
                    value={formData.publishedYear}
                    onChange={handleInputChange}
                    className="input"
                    placeholder="2023"
                    min="1000"
                    max={new Date().getFullYear()}
                  />
                </div>
              </div>

              {/* Açıklama */}
              <div>
                <label className="block text-sm font-medium mb-2">
                  Açıklama
                </label>
                <textarea
                  name="description"
                  value={formData.description}
                  onChange={handleInputChange}
                  className="input resize-none"
                  placeholder="Kitap hakkında kısa bir açıklama..."
                  rows={4}
                />
              </div>

              {/* Yorum */}
              <div>
                <label className="block text-sm font-medium mb-2">
                  Yorumun
                </label>
                <textarea
                  name="review"
                  value={formData.review}
                  onChange={handleInputChange}
                  className="input resize-none"
                  placeholder="Kitap hakkındaki düşüncelerini paylaş..."
                  rows={5}
                />
              </div>

              {/* İlerleme Göstergesi */}
              {formData.status === "reading" &&
                formData.totalPages &&
                formData.currentPage && (
                  <div className="card p-4 bg-blue-50 dark:bg-blue-900/20 border-blue-200 dark:border-blue-800">
                    <div className="flex justify-between text-sm mb-2">
                      <span className="font-medium">Okuma İlerlemen</span>
                      <span className="font-bold text-blue-600 dark:text-blue-400">
                        {progress}%
                      </span>
                    </div>
                    <div className="progress">
                      <div
                        className="progress-bar"
                        style={{ width: `${progress}%` }}
                      ></div>
                    </div>
                    <p className="text-sm text-blue-600 dark:text-blue-400 mt-2 text-center">
                      {formData.currentPage} / {formData.totalPages} sayfa
                      tamamlandı
                    </p>
                  </div>
                )}

              {/* Butonlar */}
              <div className="flex flex-col gap-4 pt-4">
                <div className="flex gap-4">
                  <Link href="/dashboard" className="btn btn-outline flex-1">
                    İptal Et
                  </Link>
                  <button
                    type="button"
                    onClick={handleDeleteBook}
                    className="btn btn-destructive flex-1"
                    disabled={saving}
                  >
                    Kitabı Sil
                  </button>
                  <button
                    type="submit"
                    className="btn btn-primary flex-1"
                    disabled={saving}
                  >
                    {saving ? "Güncelleniyor..." : "Değişiklikleri Kaydet"}
                  </button>
                </div>
              </div>
            </form>
          </div>
        </div>
      </div>

      {/* Confirm Modal */}
      <ConfirmModal
        isOpen={showDeleteModal}
        title="Kitabı Sil"
        message={`"${book?.title}" kitabını silmek istediğinizden emin misiniz? Bu işlem geri alınamaz.`}
        confirmText="Sil"
        cancelText="İptal"
        onConfirm={handleConfirmDelete}
        onCancel={handleCancelDelete}
        type="danger"
      />
    </div>
  );
}
