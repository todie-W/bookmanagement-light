import { type RequestHandler } from 'express';
import { Order } from '#models';
import type { OrderType } from '#types';
import mongoose, { Schema, model } from 'mongoose';
import '#db';

//const Order = require('../models/Order');
import { Book } from '#models';

interface OrderProduct {
  price: number;
  quantity: number;
}


export const getOrders: RequestHandler = async (req, res) => {
  const orders = await Order.find();

  res.json(orders);
};

export const createOrder: RequestHandler = async (req, res) => {
  const { userId, books } = req.body as OrderType;

  if (!userId || !books || books.length === 0)
    throw new Error('userId and books are required');
//überprüfen ob userId und productId gültige ObjectIds sind!!!-> ToDo /Zod?
//?nonExistentField: 'This field does not exist'
  const total = books.reduce<number>((sum: number, book: OrderProduct): number => {
    return sum + book.price * book.quantity;
  }, 0);

  if (total <= 0) throw new Error('Order total must be greater than zero');
 
  //const order = await Order.create({ userId, books, total });  //quantity is calculated from books, so no need to store it separately
    
                                                                  //timestamps are automatically handled by Mongoose, so no need to pass them in the request body   
  //res.json(order);
};

export const getOrderById: RequestHandler = async (req, res) => {
  const {
    params: { id } //? The id is extracted from the request parameters, which is used to find the specific order by its unique identifier
  } = req;
  const order = await Order.findById(id);
  if (!order) throw new Error('Order not found', { cause: 404 });

  res.json(order);
};

//? The updateOrder function is an Express request handler that updates an existing order in the database. It extracts the order ID from the request parameters and the updated order data from the request body. It checks if all required fields are present, finds the order by its ID, updates its properties, and saves the changes to the database. Finally, it returns the updated order as a JSON response.
export const updateOrder: RequestHandler = async (req, res) => {  
  const {
    body,
    params: { id } //? The id is extracted from the request parameters, which is used to find the specific order to update 
  } = req;

  const { userId, books } = body as OrderType;
  if (!userId || !books || books.length === 0) throw new Error('userId and books are required');


//   const total = books.reduce<number>((sum: number, book: OrderProduct): number => {
//     return sum + book.price * book.quantity;
//   }, 0);
//   if (total <= 0) throw new Error('Order total must be greater than zero');

  const order = await Order.findById(id);
  if (!order) throw new Error('Order not found', { cause: 404 });

  order.userId = new mongoose.Types.ObjectId(userId); // Update the userId of the order
  order.set('books', books); // Use the set method to update the books array
  //order.total = total;
  await order.save();  

  res.json(order); // Return the updated order as a JSON response
};

export const deleteOrder: RequestHandler = async (req, res) => {
  const {
    params: { id }
  } = req;

  const order = await Order.findByIdAndDelete(id);
  if (!order) throw new Error('Order not found', { cause: 404 });

  res.json({ message: 'Order deleted' });
};
