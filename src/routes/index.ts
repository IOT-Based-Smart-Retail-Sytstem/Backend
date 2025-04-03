import express from "express";
import user from './user.routes'
import contact from './contact.routes'
import auth from './auth.routes' ;
import product from './product.routes' ;

const router  = express.Router()

router.get('/healthcheck' , (_, res) => {
    res.sendStatus(200)}
 );

router.use(user);
router.use(contact);
router.use(auth) ;
router.use(product) ;

export default router ;