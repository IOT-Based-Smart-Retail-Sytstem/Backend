import express from 'express';
import validateResource from '../middlware/validateResource';
import { contactSchema } from '../schema/contact.schema';
import { createContactHandler , getAllContactsHandler, getContactHandler} from '../controllers/contact.controller';

const router = express.Router();

router.post(
    "/api/contact",
    validateResource(contactSchema),
    createContactHandler
);

router.get(
    "/api/contact",
    getAllContactsHandler
);

router.get(
    "/api/contact/:id",
    getContactHandler
);

export default router;