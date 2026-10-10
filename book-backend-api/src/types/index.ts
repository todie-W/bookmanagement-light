export interface OrderType {
	userId: string;
	books: Array<{
		bookId: string;
		price: number;
		quantity: number;
	}>;
}
export type UserType = {
  name: string;
  email: string;
  password: string;
};