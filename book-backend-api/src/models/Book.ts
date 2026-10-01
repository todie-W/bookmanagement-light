import { model, Schema } from 'mongoose';

const isbnPattern =
  /^(?:ISBN(?:-1[03])?:? )?(?=[0-9X]{10}$|(?=(?:[0-9]+[- ]){3})[- 0-9X]{13}$|97[89][0-9]{10}$|(?=(?:[0-9]+[- ]){4})[- 0-9]{17}$)(?:97[89][- ]?)?[0-9]{1,5}[- ]?[0-9]+[- ]?[0-9]+[- ]?[0-9X]$/;

const bookSchema = new Schema({
  author: {
    type: String,
    maxLength: 500
  },
  title: {
    type: String,
    maxLength: 500
  },
  description: {
    type: String,
    maxLength: 10000
  },
  pageNumber: {
    type: Number,
    min: 0
  },
  year: {
    type: Number,
    min: -2000,
    max: 3000
  },
  isbn: {
    type: String,
    match: isbnPattern,
    unique: true
  },
  genre: [{ type: String, maxLength: 50 }]
});

const Book = model('book', bookSchema);
export default Book;
