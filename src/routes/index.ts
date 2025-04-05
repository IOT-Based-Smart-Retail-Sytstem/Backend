import express from "express";
import user from './user/user.routes'
import contact from './user/contact.routes'
import auth from './auth.routes' ;
import product from './user/product.routes' ;
import cart from './user/cart.routes';
import category from './user/category.routes';
import wishlist from './user/wishlist.routes';

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

export default router ;