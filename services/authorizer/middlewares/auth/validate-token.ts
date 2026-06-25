import { Request, Response, NextFunction } from "express";

export const validateToken = (req: Request, res: Response, next: NextFunction) => {
    const token: string = req.headers.authorization as string;
    //jwt
}