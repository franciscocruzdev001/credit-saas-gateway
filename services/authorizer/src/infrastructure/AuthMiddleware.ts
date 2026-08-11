import { Request, Response, NextFunction } from "express";
import * as jwt from "jsonwebtoken";
import { get } from "lodash";

export interface AuthenticatedUser {
    userId: string;
    email: string;
    roles: string[];
    creditorCompanyId: string;
     permissions: string[];
}

export interface AuthenticatedRequest extends Request {
    user?: AuthenticatedUser;
}


export const authMiddleware = (req: AuthenticatedRequest, res: Response, next: NextFunction): void => {
    const authHeader = get(req.headers, "authorization", "");
    const token = authHeader.startsWith("Bearer ") ? authHeader.slice(7) : null;

    if (!token) {
        res.status(401).json({ error: 'Token no proporcionado' });
        return;
    }

    try {
        const jwtSecret = get(process.env, "JWT_SECRET", "");
        const decoded = jwt.verify(token, jwtSecret) as AuthenticatedUser;
        req.user = decoded;
        next();
    } catch (error) {
        res.status(401).json({ error: 'Token inválido o expirado' });
    }
};