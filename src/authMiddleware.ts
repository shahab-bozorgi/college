import { UserService } from "./modules/user/user.service";
import { Request, Response, NextFunction } from "express";
import jwt, { Secret, JwtPayload } from "jsonwebtoken";
import { HttpError, UnAuthorized } from "./utilities/http-error";
import { zodUsername } from "./modules/user/model/user-username";

export const SECRET_KEY: Secret =
  typeof process.env.SECRET_KEY === "string"
    ? process.env.SECRET_KEY
    : "super-secret";

export interface CustomRequest extends Request {
  token: string | JwtPayload;
}

export const authMiddleware =
  (userService: UserService) =>
  async (req: Request, res: Response, next: NextFunction) => {
    await userService.authenticateByUsername(zodUsername.parse(jwt.decode));

    try {
      const token = req.header("Authorization")?.replace("Bearer ", "");

      if (!token) {
        throw new HttpError(400, "token is invalid!");
      }

      const decoded = jwt.verify(token, SECRET_KEY);
      (req as CustomRequest).token = decoded;

      next();
    } catch {
      throw new UnAuthorized("Please authenticate");
    }
  };
