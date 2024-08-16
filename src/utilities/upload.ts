import { Request, Response, NextFunction } from "express";
import multer, { MulterError } from "multer";
import e from "express";
import { PositiveInt } from "../data/int";
import { v4 } from "uuid";
import { extname } from "path";
import fs from "fs";
import { HttpError } from "./http-error";

const uploadPath = "./uploads";

const ImgMIME = [
  "image/jpeg",
  "image/jpg",
  "image/png",
  "image/webp",
  "image/avif",
] as const;
export const imageMIMEs = [...ImgMIME];
export type ImageMIME = (typeof ImgMIME)[number];

export type MIME = ImageMIME;

const storage = (destination: string) =>
  multer.diskStorage({
    destination: (req, file, cb) => {
      const path = `${uploadPath}/${destination}`;
      if (!fs.existsSync(path)) fs.mkdirSync(path, { recursive: true });
      cb(null, path);
    },
    filename: (req, file, cb) => {
      cb(null, v4() + extname(file.originalname));
    },
  });

const fileFilter =
  (allowedMIME: MIME[]) =>
  (
    req: e.Request,
    file: Express.Multer.File,
    cb: multer.FileFilterCallback
  ) => {
    allowedMIME.includes(file.mimetype as MIME)
      ? cb(null, true)
      : cb(new HttpError(400, "Invalid File type"));
  };

export const MBToBytes = (value: PositiveInt): PositiveInt =>
  (value * 1024 * 1024) as PositiveInt;

export const uploadSingleFile =
  (
    destination: string,
    fieldName: string,
    allowedMIME: MIME[],
    maxSize: PositiveInt
  ) =>
  async (req: Request, res: Response, next: NextFunction) => {
    const uploader = multer({
      limits: {
        fileSize: maxSize,
      },
      fileFilter: fileFilter(allowedMIME),
      storage: storage(destination),
    }).single(fieldName);

    uploader(req, res, (err) => {
      if (err instanceof MulterError) {
        return next(new HttpError(400, err.message));
      } else if (err) {
        return next(err);
      }
      next();
    });
  };
