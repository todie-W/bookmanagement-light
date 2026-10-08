import { useEffect, useMemo, useRef, useState } from "react";
import type { Book } from "../types/Book";

interface SearchBookProps {
  books: Book[];
  savedBookIds: string[];
  onSelectBook: (book: Book) => void;
  onToggleBook: (book: Book) => void;
}

export default function SearchBook({
  books,
  savedBookIds,
  onSelectBook,
  onToggleBook,
}: SearchBookProps) {
  const [searchQuery, setSearchQuery] = useState("");
  const [isOpen, setIsOpen] = useState(false);
  const menuRef = useRef<HTMLDivElement>(null);

  const filteredBooks = useMemo(() => {
    const query = searchQuery.trim().toLocaleLowerCase();
    if (!query) return [];

    return books.filter(
      (book) =>
        book.title.toLocaleLowerCase().includes(query) ||
        book.author.toLocaleLowerCase().includes(query),
    );
  }, [books, searchQuery]);

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (menuRef.current && !menuRef.current.contains(event.target as Node)) {
        setIsOpen(false);
      }
    };

    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  return (
    <div ref={menuRef} className="relative w-full max-w-sm">
      <label htmlFor="book-search" className="mb-2 block text-sm font-semibold text-slate-700">
        Suche nach Bücher
      </label>
      <div className="relative">
        <input
          id="book-search"
          type="search"
          placeholder="Titel oder Autor eingeben..."
          value={searchQuery}
          onChange={(event) => {
            setSearchQuery(event.target.value);
            setIsOpen(true);
          }}
          onFocus={() => setIsOpen(true)}
          aria-expanded={isOpen && searchQuery.trim().length > 0}
          aria-controls="book-search-results"
          className="w-full rounded-xl border border-slate-200 bg-white px-4 py-3 pr-10 text-sm text-slate-800 shadow-sm outline-none transition placeholder:text-slate-400 focus:border-indigo-500 focus:ring-2 focus:ring-indigo-100"
        />
        {searchQuery && (
          <button
            type="button"
            aria-label="Suche leeren"
            onClick={() => {
              setSearchQuery("");
              setIsOpen(false);
            }}
            className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 transition hover:text-slate-700"
          >
            ×
          </button>
        )}
      </div>

      {isOpen && searchQuery.trim() && (
        <div
          id="book-search-results"
          className="absolute left-0 right-0 z-50 mt-2 max-h-80 overflow-y-auto rounded-xl border border-slate-200 bg-white shadow-xl"
          aria-label="Suchergebnisse"
        >
          {filteredBooks.length > 0 ? (
            filteredBooks.map((book) => {
              const isSaved = savedBookIds.includes(book._id);
              return (
                <div
                  key={book._id}
                  className="flex items-center gap-3 border-b border-slate-100 p-3 last:border-b-0"
                >
                  <button
                    type="button"
                    onClick={() => {
                      onSelectBook(book);
                      setIsOpen(false);
                    }}
                    className="flex min-w-0 flex-1 items-center gap-3 rounded-lg text-left hover:bg-slate-50"
                  >
                    {book.coverImage && (
                      <img
                        src={book.coverImage}
                        alt=""
                        className="h-12 w-9 rounded object-cover"
                      />
                    )}
                    <span className="flex min-w-0 flex-col">
                      <span className="truncate text-sm font-semibold text-slate-900">
                        {book.title}
                      </span>
                      <span className="truncate text-xs text-slate-500">{book.author}</span>
                    </span>
                  </button>
                  <button
                    type="button"
                    onClick={() => onToggleBook(book)}
                    aria-label={
                      isSaved
                        ? `${book.title} aus der Merkliste entfernen`
                        : `${book.title} zur Merkliste hinzufügen`
                    }
                    className="shrink-0 rounded-lg bg-indigo-50 px-3 py-2 text-xs font-semibold text-indigo-700 transition hover:bg-indigo-100"
                  >
                    {isSaved ? "Gemerkt" : "Merken"}
                  </button>
                </div>
              );
            })
          ) : (
            <p className="p-4 text-center text-sm text-slate-500">
              Keine passenden Bücher gefunden.
            </p>
          )}
        </div>
      )}
    </div>
  );
}
