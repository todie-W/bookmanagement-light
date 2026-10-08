import { useEffect, useState } from 'react';
import type { Book } from '../types/Book';
import { getReadingList } from '../utils/readingList';
import { BOOKS_API_URL } from '../utils/api';

const API_URL = BOOKS_API_URL;

export default function DeleteBook() {
  const [books, setBooks] = useState<Book[]>([]);
  const [selectedBookId, setSelectedBookId] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isDeleting, setIsDeleting] = useState(false);
  const [message, setMessage] = useState<{ text: string; isError: boolean } | null>(null);

  useEffect(() => {
    const fetchBooks = async () => {
      try {
        const response = await fetch(API_URL);
        const result = (await response.json()) as { data?: Book[]; message?: string };
        if (!response.ok) {
          throw new Error(result.message ?? `Bücher konnten nicht geladen werden (HTTP ${response.status}).`);
        }
        if (!Array.isArray(result.data)) {
          throw new Error('Die Buchliste wurde in einem ungültigen Format zurückgegeben.');
        }
        setBooks(result.data);
      } catch (error) {
        console.error('Bücher konnten nicht geladen werden:', error);
        setMessage({
          text: 'Bücher konnten nicht geladen werden. Bitte prüfe die Verbindung zum Server.',
          isError: true,
        });
      } finally {
        setIsLoading(false);
      }
    };

    fetchBooks();
  }, []);

  const handleDelete = async () => {
    const selectedBook = books.find((book) => book._id === selectedBookId);
    if (!selectedBookId || !selectedBook) {
      setMessage({ text: 'Bitte wähle zuerst ein Buch aus der Liste aus.', isError: true });
      return;
    }
    if (!window.confirm(`Möchtest du „${selectedBook.title}“ wirklich löschen?`)) return;

    setIsDeleting(true);
    setMessage(null);
    try {
      const response = await fetch(`${API_URL}/${encodeURIComponent(selectedBookId)}`, {
        method: 'DELETE',
      });
      if (!response.ok) {
        const result = (await response.json()) as { message?: string };
        throw new Error(result.message ?? `Buch konnte nicht gelöscht werden (HTTP ${response.status}).`);
      }

      setBooks((currentBooks) => currentBooks.filter((book) => book._id !== selectedBookId));
      setSelectedBookId(null);

      try {
        const updatedReadingList = getReadingList().filter((book) => book._id !== selectedBookId);
        localStorage.setItem('readingList', JSON.stringify(updatedReadingList));
        window.dispatchEvent(new Event('readingListUpdated'));
        setMessage({ text: 'Buch erfolgreich gelöscht.', isError: false });
      } catch (error) {
        console.error('Merkliste konnte nach dem Löschen nicht synchronisiert werden:', error);
        setMessage({
          text: 'Das Buch wurde gelöscht, aber die Merkliste konnte nicht synchronisiert werden.',
          isError: true,
        });
      }
    } catch (error) {
      console.error('Buch konnte nicht gelöscht werden:', error);
      setMessage({
        text: error instanceof Error ? error.message : 'Netzwerkfehler beim Löschen des Buches.',
        isError: true,
      });
    } finally {
      setIsDeleting(false);
    }
  };

  return (
    <section>
      <div className="mb-8">
        <p className="mb-2 text-sm font-semibold uppercase tracking-wider text-indigo-600">Sammlung verwalten</p>
        <h1 className="text-3xl font-bold tracking-tight text-slate-900">Buch löschen</h1>
        <p className="mt-2 text-slate-600">Wähle ein Buch aus der Liste aus, um es aus der Datenbank zu löschen.</p>
      </div>

      {message && (
        <div
          role={message.isError ? 'alert' : 'status'}
          className={`mb-5 rounded-xl border p-3 text-sm font-medium ${
            message.isError
              ? 'border-red-200 bg-red-50 text-red-700'
              : 'border-emerald-200 bg-emerald-50 text-emerald-700'
          }`}
        >
          {message.text}
        </div>
      )}

      <div className="max-w-2xl rounded-2xl border border-slate-200 bg-white p-5 shadow-sm sm:p-6">
        <h2 className="mb-4 text-lg font-bold text-slate-900">Deine Bücher</h2>
        {isLoading ? (
          <p className="text-sm text-slate-500">Bücher werden geladen …</p>
        ) : books.length === 0 ? (
          <p className="text-sm text-slate-500">Es sind keine Bücher vorhanden.</p>
        ) : (
          <div className="space-y-3">
            {books.map((book) => (
              <label
                key={book._id}
                className={`flex cursor-pointer items-center justify-between gap-3 rounded-xl border p-4 transition-colors ${
                  selectedBookId === book._id
                    ? 'border-indigo-300 bg-indigo-50'
                    : 'border-slate-200 hover:bg-slate-50'
                }`}
              >
                <span className="flex items-center gap-3">
                  <input
                    type="checkbox"
                    checked={selectedBookId === book._id}
                    aria-label={`„${book.title}“ zum Löschen auswählen`}
                    onChange={() => setSelectedBookId(selectedBookId === book._id ? null : book._id)}
                    className="h-5 w-5 cursor-pointer rounded border-slate-300 text-indigo-600 focus:ring-indigo-500"
                  />
                  <span>
                    <span className="block font-semibold text-slate-800">{book.title}</span>
                    <span className="block text-sm text-slate-500">von {book.author}</span>
                  </span>
                </span>
                {book.year !== undefined && (
                  <span className="shrink-0 rounded-full bg-slate-100 px-2.5 py-1 text-xs font-medium text-slate-600">
                    {book.year}
                  </span>
                )}
              </label>
            ))}
          </div>
        )}

        <button
          type="button"
          onClick={handleDelete}
          disabled={!selectedBookId || isDeleting || isLoading}
          className="mt-5 w-full rounded-xl bg-red-600 px-4 py-3 font-semibold text-white shadow-sm transition-colors hover:bg-red-700 focus:outline-none focus:ring-4 focus:ring-red-200 disabled:cursor-not-allowed disabled:bg-slate-400"
        >
          {isDeleting ? 'Wird gelöscht …' : 'Aus Datenbank löschen'}
        </button>
      </div>
    </section>
  );
}
