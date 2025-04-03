import { Request, Response, NextFunction } from "express";
import { Code, Status } from "../utils/httpStatus";

export const requireRole = (roles: string[]) => {
    return (req: Request, res: Response, next: NextFunction) => {
        const user = res.locals.user;

        if (!user || !roles.includes(user.role)) {
            return res.status(Code.Forbidden).json({
                status: Status.FAIL,
                message: "غير مصرح بالوصول"
            });
        }

        next();
    };
};