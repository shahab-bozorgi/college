import { Response } from "express";
import { HttpError } from "./http-error";

export const handleExpress = async <T>(res: Response, cb: () => Promise<T>) => {
  try {
    const data = await cb();
    res.status(200).json({ ok: true, data });
  } catch (error) {
    if (error instanceof HttpError) {
      let errorMessage = error.message;

      try {
        errorMessage = JSON.parse(error.message); // اگر به درستی JSON شده باشد، آن را پارس می‌کنیم
      } catch (e) {
        errorMessage = error.message;
      }

      res.status(error.code).json({
        ok: false,
        message: errorMessage,
      });
      return;
    }

    res.status(500).json({ ok: false, message: ["Internal server error!"] });
  }
};
