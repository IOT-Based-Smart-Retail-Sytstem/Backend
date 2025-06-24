import { Request, Response, NextFunction } from 'express';
import { createContact, getContactById, getAllContacts } from '../service/contact.service';

export async function createContactHandler(req: Request, res: Response, next: NextFunction) {
    const body = req.body;
    try {
        const contact = await createContact(body);
        res.status(201).json({
            success: true,
            message: "Contact created successfully",
            data: contact
        })
    } catch (e: any) {
        next(e);
    }
}

export async function getContactHandler(req: Request, res: Response, next: NextFunction) {
    const contactId = req.params.id;
    try {
        const contact = await getContactById(contactId);
        res.status(200).json({
            success: true,
            message: "Contact fetched successfully",
            data: contact
        })
    } catch (e: any) {
        next(e);
    }
}

export async function getAllContactsHandler(req: Request, res: Response, next: NextFunction) {
    try {
        const contacts = await getAllContacts(req);
        res.status(200).json({
            success: true,
            message: "Contacts fetched successfully",
            data: contacts
        })
    } catch (e: any) {
        next(e);
    }
}