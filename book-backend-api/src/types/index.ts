export interface OrderType {
	userId: string;
	books: Array<{
		bookId: string;
		price: number;
		quantity: number;
	}>;
}
