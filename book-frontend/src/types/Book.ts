export interface Book {
  _id: string;
  title: string;
  author: string;
  description?: string;
  isbn?: string;
  coverImage?: string;
  pageNumber?: number;
  year?: number;
  genre?: string;
  status?: "buy" | "borrow";
}
