import { useEffect, useState } from "react";
import type { Book } from "../types/Book";

type BookStatus = "read" | "pending";
type ReadingListBook = Book & { status: BookStatus };

const isStoredBook = (value: unknown): value is Book =>
  typeof value === "object" &&
  value !== null &&
  "_id" in value &&
  typeof value._id === "string" &&
  "title" in value &&
  typeof value.title === "string" &&
  "author" in value &&
  typeof value.author === "string";

const normalizeStoredBooks = (value: unknown): ReadingListBook[] => {
  if (!Array.isArray(value) || !value.every(isStoredBook)) {
    throw new Error("Die gespeicherte Merkliste hat ein ungültiges Format.");
  }

  return value.map((book) => ({
    ...book,
    status: book.status === "read" ? "read" : "pending",
  }));
};

const ReadingList = () => {
  const [books, setBooks] = useState<ReadingListBook[]>([]);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    let active = true;

    const loadBooks = async () => {
      try {
        const storedBooks = normalizeStoredBooks(
          JSON.parse(localStorage.getItem("readingList") ?? "[]") as unknown,
        );
        localStorage.setItem("readingList", JSON.stringify(storedBooks));

        if (active) {
          setBooks(storedBooks);
          setError(null);
        }

        const currentBooks = await Promise.all(
          storedBooks.map(async (book) => {
            const response = await fetch(`/api/books/${encodeURIComponent(book._id)}`);//aktualisiert damit den angezeigten Zustand
            if (!response.ok) {
              throw new Error(`Buch ${book._id} konnte nicht geladen werden (HTTP ${response.status}).`);
            }
            const result: { data: Book } = await response.json();
            return { ...result.data, status: book.status };
          }),
        );

        if (active) {
          setBooks(currentBooks);
          setError(null);
          localStorage.setItem("readingList", JSON.stringify(currentBooks));
        }
      } catch (loadError) {
        console.error("Reading List konnte nicht aktualisiert werden:", loadError);
        if (active) {
          setError("Aktuelle Buchdaten konnten nicht vom Server geladen werden.");
        }
      }
    };

    loadBooks();
    window.addEventListener("storage", loadBooks);
    window.addEventListener("readingListUpdated", loadBooks);//Nach erfolgreichem Datenbank-Update löst ChangeBook.tsx:114 das Ereignis aus. eadingList.tsx:65 hört darauf und startet
//damit die Aktualisierung der Anzeige der Reading List initiiert wird um Status neu anzuzeigen. Ohne diese Aktualisierung würde der Status in der Anzeige nicht aktualisiert werden, 
// da die Reading List nur aus dem LocalStorage geladen wird und nicht direkt aus der Datenbank.
    return () => {
      active = false;
      window.removeEventListener("storage", loadBooks);
      window.removeEventListener("readingListUpdated", loadBooks);
    };
  }, []);

  const handleStatusChange = (bookId: string, status: string) => {
    if (status !== "read" && status !== "pending") {
      const statusError = new Error(`Unbekannter Lesestatus: ${status}`);
      console.error("Lesestatus konnte nicht gespeichert werden:", statusError);
      setError("Der ausgewählte Lesestatus ist ungültig.");
      return;
    }

    const updatedBooks: ReadingListBook[] = books.map((book) =>
      book._id === bookId ? { ...book, status } : book,
    );

    try {
      localStorage.setItem("readingList", JSON.stringify(updatedBooks));
      setBooks(updatedBooks);
      setError(null);
      window.dispatchEvent(new Event("readingListUpdated"));
    } catch (saveError) {
      console.error("Lesestatus konnte nicht gespeichert werden:", saveError);
      setError("Der Lesestatus konnte nicht gespeichert werden.");
    }
  };

  return (
    <section>
      <div className="mb-8">
        <p className="mb-2 text-sm font-semibold uppercase tracking-wider text-indigo-600">Für später</p>
        <h1 className="text-3xl font-bold tracking-tight text-slate-900">Deine Merkliste</h1>
        <p className="mt-2 text-slate-600">Alle Bücher, die du dir fürs nächste Leseabenteuer vorgemerkt hast.</p>
      </div>
      {error && <p role="alert" className="mb-5 rounded-xl border border-red-200 bg-red-50 p-4 text-sm text-red-700">{error}</p>}
      {books.length === 0 ? (
        <div className="rounded-2xl border border-dashed border-slate-300 bg-white px-6 py-12 text-center">
          <p className="text-lg font-semibold text-slate-800">Deine Merkliste ist noch leer</p>
          <p className="mt-2 text-sm text-slate-500">Füge in der Bücherübersicht einen Titel hinzu, den du später lesen möchtest.</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
        {books.map((book) => {
          return (
            <article key={book._id} className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
              <div>
                <p className="text-xs font-semibold uppercase tracking-wider text-indigo-600">
                  {book.status === "read" ? "Gelesen" : "Noch nicht gelesen"}
                </p>
                <h2 className="mt-2 text-lg font-bold text-slate-900">{book.title}</h2>
                <p className="mt-1 text-sm font-medium text-slate-500">{book.author}</p>
                {book.description && <p className="mt-4 text-sm leading-6 text-slate-600">{book.description}</p>}
                <div className="mt-5">
                  <select
                    value={book.status}
                    aria-label={`Lesestatus für ${book.title}`}
                    className="w-full rounded-xl border border-slate-200 bg-white px-3 py-2 text-sm text-slate-700 focus:border-indigo-500 focus:outline-none focus:ring-2 focus:ring-indigo-100"
                    onChange={(event) =>
                      handleStatusChange(book._id, event.target.value)
                    }
                  >
                    <option value="pending">Noch nicht gelesen</option>
                    <option value="read">Gelesen</option>
                  </select>
                </div>
              </div>
            </article>
          );
        })}
        </div>
      )}
    </section>
  );
};


export default ReadingList;
