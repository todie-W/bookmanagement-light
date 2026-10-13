import React, { useState, useEffect, type SubmitEvent } from 'react';
import { getReadingList } from '../utils/readingList';
//IBook?   Buchauswahl, die in der DB geändert werden soll, ausführen. Die Buchliste wird aus der DB geladen und in der linken Spalte angezeigt. In der rechten Spalte kann das ausgewählte Buch geändert werden.
interface IBook {
  _id?: string;
  author: string;
  title: string;
  description?: string;
  pageNumber: number;
  year: number;
  isbn?: string;
  genre: string | string[];
}

type BookFormData = Omit<IBook, 'genre'> & {
  genre: string;
}

const BOOKS_PER_PAGE = 100;

export default function BookApp() {
  const [books, setBooks] = useState<IBook[]>([]);
  const [selectedBookId, setSelectedBookId] = useState<string | null>(null);
  const [formData, setFormData] = useState<BookFormData>({
    author: '',
    title: '',
    description: '',
    pageNumber: 0,
    year: new Date().getFullYear(),
    isbn: '',
    genre: '',
  });
  const [message, setMessage] = useState<string>('');

 // const API_URL = 'http://localhost:3000/books';
  const API_URL = '/api/books';

  const fetchBooks = async (): Promise<IBook[]> => {
    const savedBookIds = new Set(getReadingList().map((book) => book._id));
    if (savedBookIds.size === 0) return [];

    const allBooks: IBook[] = [];
    let page = 1;

    while (true) {
      const res = await fetch(`${API_URL}?page=${page}&limit=${BOOKS_PER_PAGE}`);
      if (!res.ok) {
        throw new Error(`Bücher konnten nicht geladen werden (HTTP ${res.status}).`);
      }

      const result: { data?: IBook[] } = await res.json();
      if (!Array.isArray(result.data)) {
        throw new Error('Die Buchliste wurde in einem ungültigen Format zurückgegeben.');
      }

      allBooks.push(...result.data);
      if (result.data.length < BOOKS_PER_PAGE) {
        return allBooks.filter((book) => book._id && savedBookIds.has(book._id));
      }
      page += 1;
    }
  };


  // Bücher beim Start laden
  useEffect(() => {
    let isActive = true;
    const loadBooks = async () => {
      try {
        const loadedBooks = await fetchBooks();
        if (isActive) setBooks(loadedBooks);
      } catch (err) {
        console.error('Fehler beim Abrufen der Bücher:', err);
        if (isActive) {
          setMessage('Bücher konnten nicht geladen werden. Bitte prüfe die Verbindung zum Server.');
        }
      }
    };

    void loadBooks();
    return () => {
      isActive = false;
    };
  }, []);

  // Buch auswählen über Checkbox / Häkchen
  const handleSelectBook = (book: IBook) => {
    setMessage('');
    if (book._id === selectedBookId) {
      // Wenn das gleiche Buch nochmal geklickt wird: Abwählen
      setSelectedBookId(null);
      resetForm();
    } else if (book._id) {
      setSelectedBookId(book._id);
      setFormData({
        author: book.author,
        title: book.title,
        description: book.description || '',
        pageNumber: book.pageNumber || 1,
        year: book.year || new Date().getFullYear(),
        isbn: book.isbn || '',
        genre: Array.isArray(book.genre) ? book.genre.join(', ') : book.genre || ''
      });
    }
  };

  // Formular-Eingaben verarbeiten
  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    setMessage('');
    setFormData(prev => ({
      ...prev,
      [name]: name === 'year' ? parseInt(value) || 0 : value
    }));
  };

  const resetForm = () => {
    setFormData({
      author: '',
      title: '',
      description: '',
      pageNumber: 0,
      year: new Date().getFullYear(),
      isbn: '',
      genre: '',
    });
  };

  // Absenden des Formulars (Update in der DB)
  const handleSubmit = async (e: SubmitEvent<HTMLFormElement>) => {
    e.preventDefault();
    if (!selectedBookId) {
      setMessage('Bitte wähle zuerst ein Buch aus der Liste aus!');
      return;
    }
    try {
      const response = await fetch(`${API_URL}/${selectedBookId}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          ...formData,
          genre: formData.genre.split(',').map((genre) => genre.trim()).filter(Boolean),
        })
      });

      if (response.ok) {
        try {
          const readingList: IBook[] = JSON.parse(localStorage.getItem('readingList') ?? '[]');
          if (!Array.isArray(readingList)) {
            throw new Error('Die gespeicherte Reading List hat ein ungültiges Format.');
          }
          const updatedReadingList = readingList.map(book =>
            book._id === selectedBookId
              ? {
                  ...book,
                  ...formData,
                  genre: formData.genre.split(',').map((genre) => genre.trim()).filter(Boolean),
                  _id: selectedBookId,
                }
              : book
          );
          localStorage.setItem('readingList', JSON.stringify(updatedReadingList));
          window.dispatchEvent(new Event('readingListUpdated'));
          setMessage('Buch erfolgreich aktualisiert!');
        } catch (error) {
          console.error('Reading List konnte nicht synchronisiert werden:', error);
          setMessage('Buch wurde gespeichert, aber die Reading List konnte nicht synchronisiert werden.');
        }
        try {
          setBooks(await fetchBooks());
        } catch (error) {
          console.error('Bücherliste konnte nach dem Aktualisieren nicht neu geladen werden:', error);
          setMessage('Buch wurde aktualisiert, aber die Bücherliste konnte nicht neu geladen werden.');
        }
      } else {
        setMessage('Fehler beim Aktualisieren des Buches.');
      }
    } catch (error) {
      console.error(error);
      setMessage('Netzwerkfehler.');
    }
  };

  return (
    <section>
      <div className="mb-8">
        <p className="mb-2 text-sm font-semibold uppercase tracking-wider text-indigo-600">Sammlung verwalten</p>
        <h1 className="text-3xl font-bold tracking-tight text-slate-900">Bücher bearbeiten</h1>
        <p className="mt-2 text-slate-600">Wähle ein Buch aus der Liste aus und bearbeite seine Angaben.</p>
      </div>
      <div className="grid grid-cols-1 items-start gap-6 lg:grid-cols-[1fr_1.2fr]">
      <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm sm:p-6">
        <h2 className="mb-4 text-lg font-bold text-slate-900">Deine Bücher</h2>
        <div className="space-y-3">
          {books.length === 0 ? (
            <p className="text-sm text-slate-500">Keine Bücher in der Merkliste.</p>
          ) : books.map(book => (
            <div 
              key={book._id} 
              className={`flex items-center justify-between gap-3 rounded-xl border p-4 transition-colors ${
                selectedBookId === book._id ? 'border-indigo-300 bg-indigo-50' : 'border-slate-200 hover:bg-slate-50'
              }`}
            >
              <div className="flex items-center space-x-3">
                <input
                  type="checkbox"
                  checked={selectedBookId === book._id}
                  aria-label={`"${book.title}" zum Bearbeiten auswählen`}
                  onChange={() => handleSelectBook(book)}
                  className="book-select-checkbox h-5 w-5"
                />
                <div>
                  <h3 className="font-semibold text-slate-800">{book.title}</h3>
                  <p className="text-sm text-slate-500">von {book.author}</p>
                </div>
              </div>
              <span className="shrink-0 rounded-full bg-slate-100 px-2.5 py-1 text-xs font-medium text-slate-600">
                {book.year}
              </span>
            </div>
          ))}
        </div>
      </div>

      <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm sm:p-6">
        <h2 className="mb-5 text-lg font-bold text-slate-900">
          {selectedBookId ? 'Buch bearbeiten' : 'Wähle ein Buch zum Bearbeiten'}
        </h2>

        {(message || selectedBookId) && (
          <div role="status" className="mb-5 rounded-xl border border-indigo-100 bg-indigo-50 p-3 text-sm font-medium text-indigo-700">
            {message || 'Inhalte ändern.'}
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-4">

  

          <div>
            <label className="block text-sm font-medium text-slate-700">Buchtitel</label>
            <input
              type="text"
              name="title"
              value={formData.title}
              onChange={handleInputChange}
              disabled={!selectedBookId}
              className="mt-1 block w-full rounded-xl border border-slate-300 p-2.5 text-slate-900 outline-none transition focus:border-indigo-500 focus:ring-4 focus:ring-indigo-100 disabled:bg-slate-100"
              required
            />
          </div>

           <div>
            <label className="block text-sm font-medium text-slate-700">Buchtitel</label>
            <input
              type="text"
              name="author"
              value={formData.author}
              onChange={handleInputChange}
              disabled={!selectedBookId}
              className="mt-1 block w-full rounded-xl border border-slate-300 p-2.5 text-slate-900 outline-none transition focus:border-indigo-500 focus:ring-4 focus:ring-indigo-100 disabled:bg-slate-100"
              required
            />
          </div>
          <div>
            <label htmlFor="description" className="block text-sm font-medium text-slate-700">
              Beschreibung
            </label>
            <textarea
              id="description"
              name="description"
              value={formData.description ?? ''}
              onChange={handleInputChange}
              disabled={!selectedBookId}
              rows={4}
              className="mt-1 block w-full resize-y rounded-xl border border-slate-300 p-2.5 text-slate-900 outline-none transition focus:border-indigo-500 focus:ring-4 focus:ring-indigo-100 disabled:bg-slate-100"
            />
          </div>
          
          <div>
            <label className="block text-sm font-medium text-slate-700">Seitenzahl</label>
            <input
              type="number"
              name="pageNumber"
              value={formData.pageNumber}
              onChange={handleInputChange}
              disabled={!selectedBookId}
              className="mt-1 block w-full rounded-xl border border-slate-300 p-2.5 text-slate-900 outline-none transition focus:border-indigo-500 focus:ring-4 focus:ring-indigo-100 disabled:bg-slate-100"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-slate-700">Erscheinungsjahr</label>
            <input
              type="number"
              name="year"
              value={formData.year}
              onChange={handleInputChange}
              disabled={!selectedBookId}
              className="mt-1 block w-full rounded-xl border border-slate-300 p-2.5 text-slate-900 outline-none transition focus:border-indigo-500 focus:ring-4 focus:ring-indigo-100 disabled:bg-slate-100"
            />
          </div>

           <div>
            <label className="block text-sm font-medium text-slate-700">ISBN</label>
            <input
              type="text"
              name="isbn"
              value={formData.isbn}
              onChange={handleInputChange}
              disabled={!selectedBookId}
              className="mt-1 block w-full rounded-xl border border-slate-300 p-2.5 text-slate-900 outline-none transition focus:border-indigo-500 focus:ring-4 focus:ring-indigo-100 disabled:bg-slate-100"
            />
          </div>
          <div>
            <label htmlFor="genre" className="block text-sm font-medium text-slate-700">
              Genre
            </label>
            <select
              id="genre"
              name="genre"
              value={formData.genre}
              onChange={handleInputChange}
              disabled={!selectedBookId}
              className="mt-1 block w-full rounded-xl border border-slate-300 p-2.5 text-slate-900 outline-none transition focus:border-indigo-500 focus:ring-4 focus:ring-indigo-100 disabled:bg-slate-100"
            >
              <option value="">Bitte wählen</option>
              {formData.genre &&
                ![
                  'Dokumentation',
                  'Drama',
                  'Fachbuch',
                  'Fantasy',
                  'Kinderbuch',
                  'Novelle',
                  'Reihe',
                  'Roman',
                  'Romance',
                  'Science Fiction',
                  'Thriller',
                  'Wörterbuch',
                ].includes(formData.genre) && (
                  <option value={formData.genre}>{formData.genre}</option>
                )}
              <option value="Dokumentation">Dokumentation</option>
              <option value="Drama">Drama</option>
              <option value="Fachbuch">Fachbuch</option>
              <option value="Fantasy">Fantasy</option>
              <option value="Kinderbuch">Kinderbuch</option>
              <option value="Novelle">Novelle</option>
              <option value="Reihe">Reihe</option>
              <option value="Roman">Roman</option>
              <option value="Romance">Romance</option>
              <option value="Science Fiction">Science Fiction</option>
              <option value="Thriller">Thriller</option>
              <option value="Wörterbuch">Wörterbuch</option>
            </select>
          </div>

          <button
            type="submit"
            disabled={!selectedBookId}
            className="w-full rounded-xl bg-indigo-600 px-4 py-3 font-semibold text-white shadow-sm transition-colors hover:bg-indigo-700 focus:outline-none focus:ring-4 focus:ring-indigo-200 disabled:cursor-not-allowed disabled:bg-slate-400"
          >
            Änderungen in DB speichern
          </button>
        </form>
      </div>

      </div>
    </section>
  );
}