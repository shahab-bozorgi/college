import { Response } from "express";
import { HttpError } from "./http-error";

export const handleExpress = async <T>(res: Response, cb: () => Promise<T>) => {
  try {
    const data = await cb();
    res.status(200).json({ ok: true, data });
  } catch (error) {
    if (error instanceof HttpError) {
      res.status(error.code).json({
        ok: false,
        message: error.message,
      });
      return;
    }

    res.status(500).json({ ok: false, message: ["Internal server error!"] });
  }
};
