import { Request, Response, NextFunction } from 'express';
import { createOrder, getOrderById, getUserOrders, deleteOrderById, updateOrderById } from '../service/order.service';

export const getOrderByIdHandler = async (req: Request, res: Response, next: NextFunction) => {
    const orderId = req.params.id;
    try {
        const order = await getOrderById(orderId);
        res.status(200).json({
            success: true,
            message: 'Order fetched successfully',
            data: order
        });
    } catch (error) {
        next(error);
    }
}

export const getUserOrdersHandler = async (req: Request, res: Response, next: NextFunction) => {
    const userId = req.params.id;
    try {
        const orders = await getUserOrders(userId);
        res.status(200).json({
            success: true,
            message: 'Orders fetched successfully',
            data: orders
        });
    } catch (error) {
        next(error);
    }
}

export const createOrderHandler = async (req: Request, res: Response, next: NextFunction) => {
    const { userId, cartItems, totalPrice, paymentIntentId, storeLocation } = req.body;
    try {
        const order = await createOrder(userId, cartItems, totalPrice, paymentIntentId, storeLocation);
        res.status(201).json({
            success: true,
            message: 'Order created successfully',
            data: order
        });
    } catch (error) {
        next(error);
    }
}

export const deleteOrderByIdHandler = async (req: Request, res: Response, next: NextFunction) => {
    const orderId = req.params.id;
    try {
        const order = await deleteOrderById(orderId);
        res.status(200).json({
            success: true,
            message: 'Order deleted successfully',
            data: order
        });
    } catch (error) {
        next(error)
    }
}

export const updateOrderByIdHandler = async (req: Request, res: Response, next: NextFunction) => {
    const orderId = req.params.id;
    const order = req.body;
    try {
        const updatedOrder = await updateOrderById(orderId, order);
        res.status(200).json({
            success: true,
            message: 'Order updated successfully',
            data: updatedOrder
        });
    } catch (error) {
        next(error);
    }
}