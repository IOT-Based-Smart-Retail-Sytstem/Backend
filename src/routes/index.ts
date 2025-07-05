import express from "express";
import user from './user.routes'
import contact from './contact.routes'
import auth from './auth.routes' ;
import product from './product.routes' ;
import cart from './cart.routes';
import category from './category.routes';
import wishlist from './wishlist.routes';
import payment from './payment.routes';
import order from './order.routes';
import notification from './notification.routes';
const router  = express.Router()

router.get('/healthcheck' , (_, res) => {
    res.sendStatus(200)}
 );

router.use(user);
router.use(contact);
router.use(auth) ;
router.use(product) ;
router.use(cart);
router.use(category);
router.use(wishlist);
router.use(payment);
router.use(order);
router.use('/api/notifications', notification);

export default router ;