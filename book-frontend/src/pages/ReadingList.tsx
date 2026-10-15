import { useEffect, useState } from "react";
import type { Book } from "../types/Book";
import {
  getReadingListGroups,
  saveReadingListGroups,
  type ReadingListGroup,
} from "../utils/readingList";

type BookStatus = "available" | "buy" | "borrow";
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
    status:
      book.status === "buy" || book.status === "borrow"
        ? book.status
        : "available",
  }));
};

const ReadingList = () => {
  const [books, setBooks] = useState<ReadingListBook[]>([]);
  const [groups, setGroups] = useState<ReadingListGroup[]>([]);
  const [selectedGroupId, setSelectedGroupId] = useState("");
  const [selectedBookIds, setSelectedBookIds] = useState<string[]>([]);
  const [newGroupName, setNewGroupName] = useState("");
  const [groupNameDrafts, setGroupNameDrafts] = useState<Record<string, string>>({});
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    let active = true;
    let latestRequestId = 0;

    const loadBooks = async () => {
      const requestId = ++latestRequestId;
      try {
        const storedBooks = normalizeStoredBooks(
          JSON.parse(localStorage.getItem("readingList") ?? "[]") as unknown,
        );
        const storedGroups = getReadingListGroups();
        localStorage.setItem("readingList", JSON.stringify(storedBooks));

        if (active) {
          setBooks(storedBooks);
          setGroups(storedGroups);
          setGroupNameDrafts(
            Object.fromEntries(storedGroups.map((group) => [group.id, group.name])),
          );
          setError(null);
        }

        const results = await Promise.all(
          storedBooks.map(async (book) => {
            try {
              const response = await fetch(`/api/books/${encodeURIComponent(book._id)}`);
              if (response.status === 404) {
                return { book, missing: true, failed: false };
              }
              if (!response.ok) {
                throw new Error(`HTTP ${response.status}`);
              }
              const result: { data: Book } = await response.json();
              return {
                book: { ...result.data, status: book.status },
                missing: false,
                failed: false,
              };
            } catch (loadError) {
              console.error(`Buch ${book._id} konnte nicht vom Server geladen werden:`, loadError);
              return { book, missing: false, failed: true };
            }
          }),
        );

        if (!active || requestId !== latestRequestId) return;

        const currentBooks = results
          .filter((result) => !result.missing)
          .map((result) => result.book);
        const missingBookIds = new Set(
          results.filter((result) => result.missing).map((result) => result.book._id),
        );
        const updatedGroups = storedGroups.map((group) => ({
          ...group,
          bookIds: group.bookIds.filter((bookId) => !missingBookIds.has(bookId)),
        }));
        localStorage.setItem("readingList", JSON.stringify(currentBooks));
        if (missingBookIds.size > 0) {
          localStorage.setItem("readingListGroups", JSON.stringify(updatedGroups));
        }
//falls ein Buch nicht mehr in der Datenbank vorhanden ist, wird es aus der Merkliste entfernt und die Gruppen werden aktualisiert.
        setBooks(currentBooks);
        setGroups(updatedGroups);
        if (missingBookIds.size > 0) {
          setSelectedBookIds((selectedIds) =>
            selectedIds.filter((bookId) => !missingBookIds.has(bookId)),
          );
        }
        setError(
          results.some((result) => result.failed)
            ? missingBookIds.size > 0
              ? "Nicht mehr vorhandene Bücher wurden aus der Merkliste entfernt. Für andere Bücher konnten die aktuellen Daten nicht geladen werden; gespeicherte Daten werden vorübergehend angezeigt."
              : "Aktuelle Buchdaten konnten nicht vom Server geladen werden. Gespeicherte Daten werden vorübergehend angezeigt."
            : missingBookIds.size > 0
              ? "Nicht mehr vorhandene Bücher wurden aus der Merkliste entfernt."
              : null,
        );
      } catch (loadError) {
        console.error("Reading List konnte nicht aktualisiert werden:", loadError);
        if (active && requestId === latestRequestId) {
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
      latestRequestId += 1;
      window.removeEventListener("storage", loadBooks);
      window.removeEventListener("readingListUpdated", loadBooks);
    };
  }, []);

  const handleStatusChange = (bookId: string, status: string) => {
    if (status !== "available" && status !== "buy" && status !== "borrow") {
      const statusError = new Error(`Unbekannter Beschaffungsstatus: ${status}`);
      console.error("Lesestatus konnte nicht gespeichert werden:", statusError);
      setError("Die ausgewählte Option ist ungültig.");
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
      console.error("Beschaffungsoption konnte nicht gespeichert werden:", saveError);
      setError("Die ausgewählte Option konnte nicht gespeichert werden.");
    }
  };

  const handleRemoveBook = (bookId: string) => {
    const updatedBooks = books.filter((book) => book._id !== bookId);
    const updatedGroups = groups.map((group) => ({
      ...group,
      bookIds: group.bookIds.filter((id) => id !== bookId),
    }));

    try {
      localStorage.setItem("readingList", JSON.stringify(updatedBooks));
      localStorage.setItem("readingListGroups", JSON.stringify(updatedGroups));
      setBooks(updatedBooks);
      setGroups(updatedGroups);
      setSelectedBookIds((selectedIds) => selectedIds.filter((id) => id !== bookId));
      setError(null);
      window.dispatchEvent(new Event("readingListUpdated"));
    } catch (saveError) {
      console.error("Buch konnte nicht aus der Merkliste entfernt werden:", saveError);
      setError("Das Buch konnte nicht aus der Merkliste entfernt werden.");
    }
  };

  const handleCreateGroup = (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    const name = newGroupName.trim();
    if (!name) return;

    try {
      const group: ReadingListGroup = {
        id: crypto.randomUUID(),
        name,
        bookIds: [],
      };
      const updatedGroups = [...groups, group];
      saveReadingListGroups(updatedGroups);
      setGroups(updatedGroups);
      setSelectedGroupId(group.id);
      setGroupNameDrafts((drafts) => ({ ...drafts, [group.id]: group.name }));
      setNewGroupName("");
      setError(null);
    } catch (saveError) {
      console.error("Gruppe konnte nicht erstellt werden:", saveError);
      setError("Die Gruppe konnte nicht erstellt werden.");
    }
  };

  const handleRenameGroup = (groupId: string) => {
    const name = groupNameDrafts[groupId]?.trim();
    if (!name) {
      setError("Bitte gib einen Gruppennamen ein.");
      return;
    }

    const updatedGroups = groups.map((group) =>
      group.id === groupId ? { ...group, name } : group,
    );

    try {
      saveReadingListGroups(updatedGroups);
      setGroups(updatedGroups);
      setGroupNameDrafts((drafts) => ({ ...drafts, [groupId]: name }));
      setError(null);
    } catch (saveError) {
      console.error("Gruppe konnte nicht umbenannt werden:", saveError);
      setError("Die Gruppe konnte nicht umbenannt werden.");
    }
  };

  const handleDeleteGroup = (groupId: string) => {
    const groupToDelete = groups.find((group) => group.id === groupId);
    if (!groupToDelete) return;
    
    const updatedGroups = groups.filter((group) => group.id !== groupId);

    try {
      saveReadingListGroups(updatedGroups);
      setGroups(updatedGroups);
      setGroupNameDrafts((drafts) =>
        Object.fromEntries(Object.entries(drafts).filter(([id]) => id !== groupId)),
      );
      if (selectedGroupId === groupId) setSelectedGroupId("");
      setError(null);
    } catch (saveError) {
      console.error("Gruppe konnte nicht gelöscht werden:", saveError);
      setError("Die Gruppe konnte nicht gelöscht werden.");
    }
  };

  const handleAddSelectedBooks = () => {
    const selectedGroup = groups.find((group) => group.id === selectedGroupId);
    if (!selectedGroup || selectedBookIds.length === 0) return;

    const currentBookIds = new Set(books.map((book) => book._id));
    const bookIdsToAdd = selectedBookIds.filter((id) => currentBookIds.has(id));
    const updatedGroups = groups.map((group) =>
      group.id === selectedGroupId
        ? { ...group, bookIds: [...new Set([...group.bookIds, ...bookIdsToAdd])] }
        : group,
    );

    try {
      saveReadingListGroups(updatedGroups);
      setGroups(updatedGroups);
      setSelectedBookIds([]);
      setError(null);
    } catch (saveError) {
      console.error("Bücher konnten nicht zur Gruppe hinzugefügt werden:", saveError);
      setError("Die ausgewählten Bücher konnten nicht zur Gruppe hinzugefügt werden.");
    }
  };

  const handleRemoveBookFromGroup = (groupId: string, bookId: string) => {
    const updatedGroups = groups.map((group) =>
      group.id === groupId
        ? { ...group, bookIds: group.bookIds.filter((id) => id !== bookId) }
        : group,
    );

    try {
      saveReadingListGroups(updatedGroups);
      setGroups(updatedGroups);
      setError(null);
    } catch (saveError) {
      console.error("Buch konnte nicht aus der Gruppe entfernt werden:", saveError);
      setError("Das Buch konnte nicht aus der Gruppe entfernt werden.");
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
      <details aria-labelledby="reading-list-groups-heading" className="mb-8 rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
        <summary className="mb-5 cursor-pointer">
          <h2 id="reading-list-groups-heading" className="text-xl font-bold text-slate-900">Büchergruppen</h2>
          <p className="mt-1 text-sm text-slate-600">Organisiere ausgewählte Bücher in eigenen Gruppen.</p>
        </summary>

        <form onSubmit={handleCreateGroup} className="mb-6 flex flex-col gap-3 sm:flex-row">
          <label htmlFor="new-reading-list-group" className="sr-only">Name der neuen Gruppe</label>
          <input
            id="new-reading-list-group"
            type="text"
            value={newGroupName}
            onChange={(event) => setNewGroupName(event.target.value)}
            placeholder="Name der neuen Gruppe"
            maxLength={80}
            required
            className="min-w-0 flex-1 rounded-xl border border-slate-200 px-3 py-2 text-sm text-slate-800 focus:border-indigo-500 focus:outline-none focus:ring-2 focus:ring-indigo-100"
          />
          <button
            type="submit"
            className="rounded-xl bg-indigo-600 px-4 py-2 text-sm font-semibold text-white transition hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-indigo-300"
          >
            Gruppe erstellen
          </button>
        </form>

        {groups.length > 0 && (
          <>
            <div className="mb-6 flex flex-col gap-3 rounded-xl bg-slate-50 p-4 sm:flex-row sm:items-end">
              <div className="flex-1">
                <label htmlFor="selected-reading-list-group" className="mb-2 block text-sm font-semibold text-slate-700">
                  Bücher hinzufügen zu
                </label>
                <select
                  id="selected-reading-list-group"
                  value={selectedGroupId}
                  onChange={(event) => setSelectedGroupId(event.target.value)}
                  className="w-full rounded-xl border border-slate-200 bg-white px-3 py-2 text-sm text-slate-700 focus:border-indigo-500 focus:outline-none focus:ring-2 focus:ring-indigo-100"
                >
                  <option value="">Gruppe auswählen</option>
                  {groups.map((group) => (
                    <option key={group.id} value={group.id}>{group.name}</option>
                  ))}
                </select>
              </div>
              <button
                type="button"
                onClick={handleAddSelectedBooks}
                disabled={!selectedGroupId || selectedBookIds.length === 0}
                className="rounded-xl bg-indigo-600 px-4 py-2 text-sm font-semibold text-white transition hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-indigo-300 disabled:cursor-not-allowed disabled:bg-slate-300"
              >
                Ausgewählte Bücher hinzufügen ({selectedBookIds.length})
              </button>
            </div>

          </>
        )}
      </details>
      {groups.length > 0 && (
        <section aria-label="Übersicht deiner Büchergruppen" className="mb-8 space-y-4">
          {groups.map((group) => {
            const groupBooks = group.bookIds
              .map((bookId) => books.find((book) => book._id === bookId))
              .filter((book): book is ReadingListBook => book !== undefined);
            return (
              <details key={group.id} className="relative rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
                <summary className="flex cursor-pointer items-baseline justify-between gap-3 pr-36">
                  <h2 className="text-lg font-bold text-slate-900">{group.name}</h2>
                  <span className="shrink-0 text-sm text-slate-500">{groupBooks.length} Bücher</span>
                </summary>
                <button
                  type="button"
                  onClick={() => handleDeleteGroup(group.id)}
                  aria-label={`Gruppe ${group.name} löschen`}
                  className="absolute right-5 top-4 rounded-xl border border-red-200 px-3 py-2 text-sm font-semibold text-red-700 transition hover:bg-red-50"
                >
                  Gruppe löschen
                </button>
                <div className="mt-4">
                  <div className="flex flex-col gap-3 sm:flex-row sm:items-center">
                    <label htmlFor={`group-name-${group.id}`} className="sr-only">Gruppenname bearbeiten</label>
                    <input
                      id={`group-name-${group.id}`}
                      type="text"
                      value={groupNameDrafts[group.id] ?? group.name}
                      onChange={(event) =>
                        setGroupNameDrafts((drafts) => ({ ...drafts, [group.id]: event.target.value }))
                      }
                      maxLength={80}
                      className="min-w-0 flex-1 rounded-xl border border-slate-200 px-3 py-2 text-sm font-semibold text-slate-800 focus:border-indigo-500 focus:outline-none focus:ring-2 focus:ring-indigo-100"
                    />
                    <button
                      type="button"
                      onClick={() => handleRenameGroup(group.id)}
                      className="rounded-xl border border-slate-300 px-3 py-2 text-sm font-semibold text-slate-700 transition hover:bg-slate-50"
                    >
                      Umbenennen
                    </button>
                  </div>
                  {groupBooks.length === 0 ? (
                    <p className="mt-3 text-sm text-slate-500">Noch keine Bücher in dieser Gruppe.</p>
                  ) : (
                    <ul className="mt-3 divide-y divide-slate-100">
                      {groupBooks.map((book) => (
                        <li key={book._id} className="flex items-center justify-between gap-3 py-2">
                          <span className="min-w-0 truncate text-sm text-slate-700">
                            {book.title} <span className="text-slate-500">– {book.author}</span>
                          </span>
                          <button
                            type="button"
                            onClick={() => handleRemoveBookFromGroup(group.id, book._id)}
                            className="shrink-0 text-sm font-medium text-red-700 hover:underline"
                          >
                            Aus Gruppe entfernen
                          </button>
                        </li>
                      ))}
                    </ul>
                  )}
                </div>
              </details>
            );
          })}
        </section>
      )}
      {books.length === 0 ? (
        <div className="rounded-2xl border border-dashed border-slate-300 bg-white px-6 py-12 text-center">
          <p className="text-lg font-semibold text-slate-800">Deine Merkliste ist noch leer</p>
          <p className="mt-2 text-sm text-slate-500">Füge in der Bücherübersicht einen Titel hinzu, den du später lesen möchtest.</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
        {books.map((book) => {
          const isSelected = selectedBookIds.includes(book._id);
          return (
            <article key={book._id} className="flex flex-col rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
              <div className="flex flex-1 flex-col">
                {groups.length > 0 && (
                  <label className="mb-3 flex items-center gap-2 text-sm font-medium text-slate-700">
                    <input
                      type="checkbox"
                      checked={isSelected}
                      onChange={(event) =>
                        setSelectedBookIds((selectedIds) =>
                          event.target.checked
                            ? [...selectedIds, book._id]
                            : selectedIds.filter((id) => id !== book._id),
                        )
                      }
                      className="book-select-checkbox h-4 w-4"
                    />
                    Für Gruppe auswählen
                  </label>
                )}
                <p className="text-xs font-semibold uppercase tracking-wider text-indigo-600">
                  {book.status === "buy"
                    ? "Verkauft"
                    : book.status === "borrow"
                      ? "Verliehen"
                      : "Verfügbar"}
                </p>
                <h2 className="mt-2 text-lg font-bold text-slate-900">{book.title}</h2>
                <p className="mt-1 text-sm font-medium text-slate-500">{book.author}</p>
                <div className="mt-auto pt-5">
                  <details className="mb-3 rounded-xl border border-slate-200 px-3 py-2">
                    <summary className="cursor-pointer text-sm font-semibold text-indigo-700">
                      Details
                    </summary>
                    <dl className="mt-3 space-y-2 text-sm">
                      {book.description && (
                        <div>
                          <dt className="font-semibold text-slate-700">Beschreibung</dt>
                          <dd className="mt-0.5 whitespace-pre-line leading-6 text-slate-600">{book.description}</dd>
                        </div>
                      )}
                      {book.genre && (
                        <div>
                          <dt className="font-semibold text-slate-700">Genre</dt>
                          <dd className="mt-0.5 text-slate-600">{book.genre}</dd>
                        </div>
                      )}
                      {book.year !== undefined && (
                        <div>
                          <dt className="font-semibold text-slate-700">Erscheinungsjahr</dt>
                          <dd className="mt-0.5 text-slate-600">{book.year}</dd>
                        </div>
                      )}
                      {book.pageNumber !== undefined && (
                        <div>
                          <dt className="font-semibold text-slate-700">Seitenzahl</dt>
                          <dd className="mt-0.5 text-slate-600">{book.pageNumber}</dd>
                        </div>
                      )}
                      {book.isbn && (
                        <div>
                          <dt className="font-semibold text-slate-700">ISBN</dt>
                          <dd className="mt-0.5 text-slate-600">{book.isbn}</dd>
                        </div>
                      )}
                      {!book.description && !book.genre && book.year === undefined &&
                        book.pageNumber === undefined && !book.isbn && (
                          <p className="text-slate-500">Keine weiteren Details verfügbar.</p>
                        )}
                    </dl>
                  </details>
                  <select
                    value={book.status}
                    aria-label={`Option für ${book.title}`}
                    className="w-full rounded-xl border border-slate-200 bg-white px-3 py-2 text-sm text-slate-700 focus:border-indigo-500 focus:outline-none focus:ring-2 focus:ring-indigo-100"
                    onChange={(event) =>
                      handleStatusChange(book._id, event.target.value)
                    }
                  >
                    <option value="available">Verfügbar</option>
                    <option value="buy">Kaufen</option>
                    <option value="borrow">Leihen</option>
                  </select>
                  <button
                    type="button"
                    onClick={() => handleRemoveBook(book._id)}
                    className="mt-2 w-full rounded-xl border border-red-200 px-3 py-2 text-sm font-semibold text-red-700 transition hover:bg-red-50 focus:outline-none focus:ring-2 focus:ring-red-200"
                  >
                    Aus der Merkliste entfernen
                  </button>
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
