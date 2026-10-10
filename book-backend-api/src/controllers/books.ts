import type { RequestHandler } from 'express';
import { Book } from '#models';
import type { bookSchemas } from '#schemas';
import type z from 'zod';

type NoRouterParams = Record<string, never>;
type BookParams = { id: string };
type BookQuery = { page?: string; limit?: string };
type BookResBody = { data: unknown };
type BookBody = z.infer<typeof bookSchemas>;

export const createBook: RequestHandler<NoRouterParams, BookResBody, BookBody> = async (
  req,
  res
) => {
  const book = await Book.create(req.body);
  res.status(201).json({ data: book });
};

export const getAllBooks: RequestHandler<NoRouterParams, BookResBody, unknown, BookQuery> = async (
  req,
  res
) => {
  const { page, limit } = req.query;
  const parsedPage = page ? parseInt(page, 10) : 1;
  const parsedLimit = limit ? parseInt(limit, 10) : 10;
  const offset = (parsedPage - 1) * parsedLimit;

  const books = await Book.find().limit(parsedLimit).skip(offset);
  res.json({ data: books });
};

export const getOneBook: RequestHandler<BookParams, BookResBody> = async (req, res) => {
  const { id } = req.params;
  const book = await Book.findById(id);
  if (!book) throw new Error('Book not found', { cause: { status: 404 } });
  res.json({ data: book });
};

export const updateOneBook: RequestHandler<BookParams, BookResBody, BookBody> = async (
  req,
  res
) => {
  const { id } = req.params;
  const book = await Book.findByIdAndUpdate(id, req.body, { new: true, runValidators: true });
  if (!book) throw new Error('Book not found', { cause: { status: 404 } });
  res.json({ data: book });
};

export const deleteBook: RequestHandler<BookParams, BookResBody> = async (req, res) => {
  const { id } = req.params;
  const book = await Book.findByIdAndDelete(id);
  if (!book) throw new Error('Book not found', { cause: { status: 404 } });
  res.json({ data: book });
};
