import { OrderModel } from "../models/order.model";

export async function createOrder(
  userId: string, 
  cartItems: any[], 
  totalPrice: number, 
  paymentIntentId: string,
  storeLocation: string = 'Main Store'
) {
  // Transform cart items to order items format with scan timestamps
  const orderItems = cartItems.map(item => ({
    product: item.product._id,
    quantity: item.quantity,
    price: item.product.price,
    scannedAt: new Date() // In real implementation, this would come from scan timestamp
  }));

  const order = await OrderModel.create({
    user: userId,
    items: orderItems,
    totalPrice,
    status: 'completed',
    paymentMethod: 'stripe',
    paymentIntentId,
    storeLocation
  });
  
  return order;
}

export async function getUserOrders(userId: string) {
  return await OrderModel.find({ user: userId })
    .populate('items.product')
    .sort({ createdAt: -1 });
}

export async function getOrderById(orderId: string) {
  return await OrderModel.findById(orderId)
    .populate('items.product')
    .populate('user');
}

export async function deleteOrderById(orderId: string) {
  return await OrderModel.findByIdAndDelete(orderId);
}

export async function updateOrderById(orderId: string, order: any) {
  console.log("order", order)
  return await OrderModel.findByIdAndUpdate(orderId, order, { new: true });
}