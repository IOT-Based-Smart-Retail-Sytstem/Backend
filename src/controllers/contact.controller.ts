import { Request, Response } from 'express';
import { createContact, getContactById, getAllContacts } from '../service/contact.service';
import log from '../utils/logger';

export async function createContactHandler(req: Request, res: Response) {
    const body = req.body;
    try {
        const contact = await createContact(body);
        res.status(201).json({
            success: true,
            message: "Contact created successfully",
            data: contact
        })
    } catch (e: any) {
        throw e;
    }
}

export async function getContactHandler(req: Request, res: Response) {
    const contactId = req.params.id;
    try {
        const contact = await getContactById(contactId);
        res.send(contact);
    } catch (e: any) {
        throw e;
    }
}

export async function getAllContactsHandler(req: Request, res: Response) {
    try {
        const contacts = await getAllContacts(req);
        res.send(contacts);
    } catch (e: any) {
        throw e;
    }
}