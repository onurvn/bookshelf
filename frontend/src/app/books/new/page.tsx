"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { useToast } from "@/hooks/useToast";
import { apiUrl } from "@/lib/api";

export default function NewBookPage() {
  const [loading, setLoading] = useState(false);
  const router = useRouter();
  const toast = useToast();

  const [formData, setFormData] = useState({
    title: "",
    author: "",
    description: "",
    totalPages: "",
    currentPage: "0",
    status: "want-to-read",
    rating: "",
    review: "",
    genre: "",
    publishedYear: "",
    isbn: "",
  });

  const handleChange = (
    e: React.ChangeEvent<
      HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement
    >
  ) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value,
    });
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!formData.title || !formData.author || !formData.totalPages) {
      toast.warning("Lütfen gerekli alanları doldurun");
      return;
    }

    setLoading(true);

    try {
      const token = localStorage.getItem("token");
      if (!token) {
        router.push("/login");
        return;
      }

      const bookData = {
        ...formData,
        totalPages: Number(formData.totalPages),
        currentPage: Number(formData.currentPage || 0),
        rating: formData.rating ? Number(formData.rating) : undefined,
        publishedYear: formData.publishedYear
          ? Number(formData.publishedYear)
          : undefined,
      };

      const response = await fetch(apiUrl("/books"), {
        method: "POST",
        headers: {
          Authorization: `Bearer ${token}`,
          "Content-Type": "application/json",
        },
        body: JSON.stringify(bookData),
      });

      const data = await response.json();

      if (data.success) {
        toast.success("Kitap başarıyla eklendi!");
        router.push("/dashboard");
      } else {
        toast.error(data.message || "Kitap eklenirken hata oluştu");
      }
    } catch (error) {
      toast.error("Kitap eklenirken hata oluştu");
      console.error(error);
    } finally {
      setLoading(false);
    }
  };

  const progress =
    formData.totalPages && formData.currentPage
      ? Math.round(
          (Number(formData.currentPage) / Number(formData.totalPages)) * 100
        )
      : 0;

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
              <h1 className="text-xl font-bold">Yeni Kitap Ekle</h1>
            </div>
          </div>
        </div>
      </header>

      <div className="container py-8">
        <div className="max-w-2xl mx-auto">
          <div className="card p-6">
            <form onSubmit={handleSubmit} className="space-y-6">
              {/* Temel Bilgiler */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium mb-2">
                    Kitap Başlığı *
                  </label>
                  <input
                    name="title"
                    type="text"
                    required
                    value={formData.title}
                    onChange={handleChange}
                    className="input"
                    placeholder="Kitap başlığını girin"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium mb-2">
                    Yazar *
                  </label>
                  <input
                    name="author"
                    type="text"
                    required
                    value={formData.author}
                    onChange={handleChange}
                    className="input"
                    placeholder="Yazar adını girin"
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
                  rows={3}
                  value={formData.description}
                  onChange={handleChange}
                  className="input resize-none"
                  placeholder="Kitap hakkında kısa açıklama"
                />
              </div>

              {/* Sayfa ve Durum */}
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div>
                  <label className="block text-sm font-medium mb-2">
                    Toplam Sayfa *
                  </label>
                  <input
                    name="totalPages"
                    type="number"
                    min="1"
                    required
                    value={formData.totalPages}
                    onChange={handleChange}
                    className="input"
                    placeholder="0"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium mb-2">
                    Mevcut Sayfa
                  </label>
                  <input
                    name="currentPage"
                    type="number"
                    min="0"
                    max={formData.totalPages || undefined}
                    value={formData.currentPage}
                    onChange={handleChange}
                    className="input"
                    placeholder="0"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium mb-2">
                    Durum *
                  </label>
                  <select
                    name="status"
                    value={formData.status}
                    onChange={handleChange}
                    className="input"
                  >
                    <option value="want-to-read">Okunacak</option>
                    <option value="reading">Okunuyor</option>
                    <option value="completed">Tamamlandı</option>
                  </select>
                </div>
              </div>

              {/* Puan ve Yorum (sadece tamamlanan kitaplar için) */}
              {formData.status === "completed" && (
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium mb-2">
                      Puan (1-5)
                    </label>
                    <select
                      name="rating"
                      value={formData.rating}
                      onChange={handleChange}
                      className="input"
                    >
                      <option value="">Puan seçin</option>
                      <option value="1">1 ⭐</option>
                      <option value="2">2 ⭐⭐</option>
                      <option value="3">3 ⭐⭐⭐</option>
                      <option value="4">4 ⭐⭐⭐⭐</option>
                      <option value="5">5 ⭐⭐⭐⭐⭐</option>
                    </select>
                  </div>

                  <div>
                    <label className="block text-sm font-medium mb-2">
                      Yorum
                    </label>
                    <textarea
                      name="review"
                      rows={3}
                      value={formData.review}
                      onChange={handleChange}
                      className="input resize-none"
                      placeholder="Kitap hakkındaki düşünceleriniz"
                    />
                  </div>
                </div>
              )}

              {/* Ek Bilgiler */}
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div>
                  <label className="block text-sm font-medium mb-2">Tür</label>
                  <input
                    name="genre"
                    type="text"
                    value={formData.genre}
                    onChange={handleChange}
                    className="input"
                    placeholder="Roman, Bilim Kurgu, vb."
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium mb-2">
                    Yayın Yılı
                  </label>
                  <input
                    name="publishedYear"
                    type="number"
                    min="1000"
                    max={new Date().getFullYear()}
                    value={formData.publishedYear}
                    onChange={handleChange}
                    className="input"
                    placeholder="2023"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium mb-2">ISBN</label>
                  <input
                    name="isbn"
                    type="text"
                    value={formData.isbn}
                    onChange={handleChange}
                    className="input"
                    placeholder="978-0000000000"
                  />
                </div>
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
              <div className="flex gap-4 pt-4">
                <Link href="/dashboard" className="btn btn-outline flex-1">
                  İptal
                </Link>
                <button
                  type="submit"
                  disabled={loading}
                  className="btn btn-primary flex-1"
                >
                  {loading ? "Ekleniyor..." : "Kitap Ekle"}
                </button>
              </div>
            </form>
          </div>
        </div>
      </div>
    </div>
  );
}
