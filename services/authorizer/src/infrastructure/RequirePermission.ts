import { Response, NextFunction } from "express";
import { get } from "lodash";
import { AuthenticatedRequest } from "./AuthMiddleware";
import { PermissionsEnum } from "../constant/PermissionsEnum";

export const requirePermission = (permission: PermissionsEnum) => {
  return (req: AuthenticatedRequest, res: Response, next: NextFunction): void => {
    const userPermissions: string[] = get(req, "user.permissions", []);

    if (!userPermissions.includes(permission)) {
      res.status(403).json({ error: `No tienes permiso para realizar esta acción (${permission})` });
      return;
    }

    next();
  };
};
