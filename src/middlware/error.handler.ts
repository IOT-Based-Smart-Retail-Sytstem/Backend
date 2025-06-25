import { Request, Response, NextFunction } from 'express';
import { ZodError } from 'zod';
import log from '../utils/logger';
import { CustomError } from '../utils/custom.error';

export const errorHandler = (
    error: unknown,
    req: Request,
    res: Response,
    next: NextFunction
) => {
    // Check if response has already been sent
    if (res.headersSent) {
        return next(error);
    }

    if (error instanceof CustomError) {
        return res.status(error.statusCode).json({
            success: false,
            message: error.message,
        });
    }

    if (error instanceof ZodError) {
        return res.status(400).json({
            success: false,
            message: 'Validation failed',
            errors: error.errors.map((err) => ({
                field: err.path.join('.'),
                message: err.message,
            })),
        });
    }

    // Log unexpected errors for debugging
    log.error('Unexpected error:', error);

    // Handle generic errors
    return res.status(500).json({
        success: false,
        message: 'Internal server error',
    });
};