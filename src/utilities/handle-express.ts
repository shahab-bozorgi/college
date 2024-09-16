import { Request, Response } from "express";
import { errorHandler } from "./error-handler";

export const expressHandler = async <T>(
  req: Request,
  res: Response,
  cb: () => Promise<T>
) => {
  try {
    const data = await cb();
    res.status(200).json({ ok: true, data });
  } catch (error) {
    errorHandler(error, req, res, () => {});
  }
};
