import { Request, Response, NextFunction } from 'express';
import { ZodError } from 'zod';
import log from '../utils/logger';
import { CustomError } from '../utils/custom.error';


export const errorHandler = (
    error: unknown, // Use `unknown` instead of `Error` for better type safety
    req: Request,
    res: Response,
    next: NextFunction
  ) => {
    if (error instanceof CustomError) {
        res.status(error.statusCode).json({
            success: false,
            message: error.message,
        });
    }

    if (error instanceof ZodError) {
        res.status(400).json({
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
    res.status(500).json({
        success: false,
        message: 'Internal server error',
    });
};