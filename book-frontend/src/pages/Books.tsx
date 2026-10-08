import { useEffect, useState } from 'react';
import SearchBook from './SearchBook';
import type { Book } from '../types/Book';
import { getReadingList, toggleBookInReadingList } from '../utils/readingList';
import { BOOKS_API_URL } from '../utils/api';

const BOOKS_PER_PAGE = 9;

const Books = () => {
  const [books, setBooks] = useState<Book[] | null>(null);
  const [page, setPage] = useState(1);
  const [bookLoadError, setBookLoadError] = useState<string | null>(null);
  const [savedBookIds, setSavedBookIds] = useState<string[]>([]);
  const [readingListError, setReadingListError] = useState<string | null>(null);
  const [selectedBookId, setSelectedBookId] = useState<string | null>(null);

  useEffect(() => {
    let isActive = true;
    const fetchAllBooks = async () => {
      try {
        const allBooks: Book[] = [];
        let currentPage = 1;

        while (true) {
          const res = await fetch(`${BOOKS_API_URL}?page=${currentPage}&limit=${BOOKS_PER_PAGE}`);
          const { data, message } = (await res.json()) as {
            data?: Book[];
            message?: string;
          };
          if (!res.ok) {
            throw new Error(message ?? `Bücher konnten nicht geladen werden (HTTP ${res.status}).`);
          }
          if (!Array.isArray(data)) {
            throw new Error('Die Buchliste wurde in einem ungültigen Format zurückgegeben.');
          }
          allBooks.push(...data);
          if (data.length < BOOKS_PER_PAGE) break;
          currentPage += 1;
        }

        if (isActive) {
          setBooks(allBooks);
          setBookLoadError(null);
        }
      } catch (error) {
        console.error('Bücher konnten nicht geladen werden:', error);
        if (isActive) {
          setBooks([]);
          setBookLoadError('Die Bücher konnten nicht geladen werden. Bitte versuche es später erneut.');
        }
      }
    };

    void fetchAllBooks();
    return () => {
      isActive = false;
    };
  }, []);

  const pageCount = Math.max(1, Math.ceil((books?.length ?? 0) / BOOKS_PER_PAGE));
  const visibleBooks = books?.slice((page - 1) * BOOKS_PER_PAGE, page * BOOKS_PER_PAGE) ?? [];

  useEffect(() => {
    if (!selectedBookId) return;
    const animationFrame = requestAnimationFrame(() => {
      document.getElementById(`book-${selectedBookId}`)?.scrollIntoView({
        behavior: 'smooth',
        block: 'center',
      });
    });
    return () => cancelAnimationFrame(animationFrame);
  }, [page, selectedBookId]);

  useEffect(() => {
    const syncReadingList = () => {
      try {
        setSavedBookIds(getReadingList().map((book) => book._id));
        setReadingListError(null);
      } catch (error) {
        console.error('Merkliste konnte nicht geladen werden:', error);
        setReadingListError('Die Merkliste konnte nicht geladen werden. Bitte prüfe den Browser-Speicher.');
      }
    };

    syncReadingList();
    window.addEventListener('storage', syncReadingList);
    window.addEventListener('readingListUpdated', syncReadingList);
    return () => {
      window.removeEventListener('storage', syncReadingList);
      window.removeEventListener('readingListUpdated', syncReadingList);
    };
  }, []);

  const handleToggleBook = (book: Book) => {
    try {
      toggleBookInReadingList(book);
      setReadingListError(null);
    } catch (error) {
      console.error('Buch konnte nicht in der Merkliste gespeichert werden:', error);
      setReadingListError('Das Buch konnte nicht in der Merkliste gespeichert werden.');
    }
  };

  const handleSelectBook = (book: Book) => {
    const bookIndex = books?.findIndex((item) => item._id === book._id) ?? -1;
    if (bookIndex >= 0) {
      setPage(Math.floor(bookIndex / BOOKS_PER_PAGE) + 1);
      setSelectedBookId(book._id);
    }
  };

  return (
    <section>
      <div className="mb-8">
        <div>
          <p className="mb-2 text-sm font-semibold uppercase tracking-wider text-indigo-600">Sammlung</p>
          <h1 className="text-3xl font-bold tracking-tight text-slate-900">Bücher entdecken</h1>
          <p className="mt-2 text-slate-600">Stöbere durch deine Bücher und speichere interessante Titel für später.</p>
        </div>
      </div>
      <div className="mb-8 flex flex-wrap items-end justify-between gap-4">
        <SearchBook
          books={books ?? []}
          savedBookIds={savedBookIds}
          onSelectBook={handleSelectBook}
          onToggleBook={handleToggleBook}
        />
        <div className="flex items-center gap-3">
          <span className="text-sm text-slate-500">Seite {page} von {pageCount}</span>
          <button
            type="button"
            aria-label="Vorherige Seite"
            onClick={() => setPage((prev) => (prev === 1 ? pageCount : prev - 1))}
            className="grid h-10 w-10 place-items-center rounded-xl border border-slate-200 bg-white text-slate-700 shadow-sm transition hover:bg-slate-100"
            disabled={pageCount <= 1}
          >
            ‹
          </button>
          <button
            type="button"
            aria-label="Nächste Seite"
            onClick={() => setPage((prev) => (prev === pageCount ? 1 : prev + 1))}
            className="grid h-10 w-10 place-items-center rounded-xl border border-slate-200 bg-white text-slate-700 shadow-sm transition hover:bg-slate-100 disabled:cursor-not-allowed disabled:opacity-50"
            disabled={pageCount <= 1}
          >
            ›
          </button>
        </div>
      </div>
      {bookLoadError && (
        <p role="alert" className="mb-5 rounded-xl border border-red-200 bg-red-50 p-4 text-sm text-red-700">
          {bookLoadError}
        </p>
      )}
      {readingListError && (
        <p role="alert" className="mb-5 rounded-xl border border-red-200 bg-red-50 p-4 text-sm text-red-700">
          {readingListError}
        </p>
      )}
      <div className="grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-3">
        {visibleBooks.map((book) => (
          <article
            id={`book-${book._id}`}
            key={book._id}
            className={`flex flex-col overflow-hidden rounded-2xl border bg-white shadow-sm transition hover:-translate-y-0.5 hover:shadow-md ${
              selectedBookId === book._id ? 'border-indigo-500 ring-2 ring-indigo-200' : 'border-slate-200'
            }`}
          >
            <figure className="book-cover-frame relative aspect-3/4 w-full overflow-hidden bg-slate-100">
           <img
              src={
                book.isbn
                  ?`https://covers.openlibrary.org/b/isbn/${encodeURIComponent(book.isbn)}-M.jpg?default=false`
                  : ''
              }
              alt={`kein Cover für ${book.title}`}
              className="book-cover"
              loading="lazy"
            />
              {/*als Alternative, wenn ISBN vorhanden ist:
              <img
                src={
                  book.isbn
                    ? `https://covers.openlibrary.org/b/isbn/${encodeURIComponent(book.isbn)}-M.jpg`
                    : 'https://covers.openlibrary.org/b/id/11481354-M.jpg'
                }
                alt={`Cover von ${book.title}`}
                className="rounded-xl"
                loading="lazy"
                  //oder:
                  height={240}
                src="https://covers.openlibrary.org/b/id/11481354-M.jpg"
                alt=""
                className="rounded-xl"
              />
              als Alternative, wenn kein ISBN vorhanden ist und ein Hilfsbild angezeigt werden soll:
                 <img
              src={
                book.isbn
                  ? `https://covers.openlibrary.org/b/isbn/${encodeURIComponent(book.isbn)}-M.jpg?default=false`
                  : 'https://covers.openlibrary.org/b/id/11481354-M.jpg'
              }
              alt={`Cover von ${book.title}`}
              className="rounded-xl"
              loading="lazy"
              onError={(event) => {
                event.currentTarget.onerror = null;
                event.currentTarget.src = 'https://covers.openlibrary.org/b/id/11481354-M.jpg';
              }}
            />

            
              */}
            </figure>
            <div className="flex flex-1 flex-col p-5">
              <h2 className="text-lg font-bold text-slate-900">{book.title}</h2>
              <h3 className="mt-1 text-sm font-medium text-slate-500">{book.author}</h3>
              <p className="mt-4 line-clamp-3 flex-1 text-sm leading-6 text-slate-600">{book.description}</p>
              <div className="mt-5">
                <button
                  type="button"
                  onClick={() => handleToggleBook(book)}
                  className="w-full rounded-xl bg-indigo-50 px-4 py-2.5 text-sm font-semibold text-indigo-700 transition hover:bg-indigo-100"
                >
                  {savedBookIds.includes(book._id)
                    ? 'Aus der Merkliste entfernen'
                    : 'Zur Merkliste hinzufügen'}
                </button>
              </div>
            </div>
          </article>
        ))}
      </div>
    </section>
  );
};

export default Books;
