import { Router } from 'express';
import { createBook, deleteBook, getAllBooks, getOneBook, updateOneBook } from '#controllers';
import { validateRequest } from '#middleware';
import { bookSchemas } from '#schemas';

const bookRoutes = Router();

bookRoutes.post('/', validateRequest(bookSchemas), createBook);

bookRoutes.get('/', getAllBooks);

bookRoutes.get('/:id', getOneBook);

bookRoutes.put('/:id', updateOneBook);

bookRoutes.delete('/:id', deleteBook);

export default bookRoutes;
