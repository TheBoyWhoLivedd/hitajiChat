import { NextApiRequest, NextApiResponse } from "next";
import multer, { MulterError } from "multer";
import nextConnect from "next-connect";

export const multerMiddleware = (multerInstance: multer.Multer) =>
  nextConnect<NextApiRequest, NextApiResponse>().use(async (req, res, next) => {
    await new Promise<void>((resolve, reject) => {
      //@ts-ignore
      multerInstance.array("file")(req, res, (err) => {
        if (err instanceof MulterError) {
          return reject(err);
        } else if (err) {
          return reject(err);
        }
        resolve();
      });
    }).catch((err) => {
      if (err instanceof MulterError) {
        res.status(400).json({ status: "error", message: err.message });
      } else {
        res.status(500).json({ status: "error", message: err.message });
      }
    });

    next();
  });
