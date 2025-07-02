import express from 'express';
import { getOrderByIdHandler, getUserOrdersHandler, deleteOrderByIdHandler, updateOrderByIdHandler, createOrderHandler } from '../controllers/order.controller';

const router = express.Router();

router.get(
    "/api/order/:id",
    getOrderByIdHandler
);

router.get(
    "/api/order/user/:id",
    getUserOrdersHandler
);

router.post(
    "/api/order",
    createOrderHandler
);


router.delete(
    "/api/order/:id",
    deleteOrderByIdHandler
);

router.put(
    "/api/order/:id",
    updateOrderByIdHandler
);

export default router;


