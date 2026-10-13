import type { Book } from "../types/Book";
//neugebaut für die Suche und Speicherung von Büchern in der Merkliste. Die Merkliste wird im LocalStorage gespeichert und kann von verschiedenen Komponenten genutzt werden, ohne dass einzelne Komponenten oder Services etwas ändern müssen.
export interface ReadingListGroup {
  id: string;
  name: string;
  bookIds: string[];
}

const isBook = (value: unknown): value is Book =>
  typeof value === "object" &&
  value !== null &&
  "_id" in value &&
  typeof value._id === "string" &&
  "title" in value &&
  typeof value.title === "string" &&
  "author" in value &&
  typeof value.author === "string";

const isReadingListGroup = (value: unknown): value is ReadingListGroup =>
  typeof value === "object" &&
  value !== null &&
  "id" in value &&
  typeof value.id === "string" &&
  "name" in value &&
  typeof value.name === "string" &&
  "bookIds" in value &&
  Array.isArray(value.bookIds) &&
  value.bookIds.every((bookId) => typeof bookId === "string");

export const getReadingList = (): Book[] => {
  const storedBooks: unknown = JSON.parse(localStorage.getItem("readingList") ?? "[]");
  if (!Array.isArray(storedBooks) || !storedBooks.every(isBook)) {
    throw new Error("Die gespeicherte Merkliste hat ein ungültiges Format.");
  }
  return storedBooks;
};

export const getReadingListGroups = (): ReadingListGroup[] => {
  const storedGroups: unknown = JSON.parse(localStorage.getItem("readingListGroups") ?? "[]");
  if (!Array.isArray(storedGroups) || !storedGroups.every(isReadingListGroup)) {
    throw new Error("Die gespeicherten Merkliste-Gruppen haben ein ungültiges Format.");
  }
  return storedGroups;
};

export const saveReadingListGroups = (groups: ReadingListGroup[]): void => {
  localStorage.setItem("readingListGroups", JSON.stringify(groups));
  window.dispatchEvent(new Event("readingListUpdated"));
};

export const toggleBookInReadingList = (book: Book): boolean => {
  const readingList = getReadingList();
  const isSaved = readingList.some((item) => item._id === book._id);
  const updatedReadingList = isSaved
    ? readingList.filter((item) => item._id !== book._id)
    : [...readingList, { ...book, status: "buy" }];

  localStorage.setItem("readingList", JSON.stringify(updatedReadingList));
  window.dispatchEvent(new Event("readingListUpdated"));

  return !isSaved;
};
