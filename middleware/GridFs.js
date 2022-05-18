import multer from "multer";
import { GridFsStorage } from "multer-gridfs-storage";
import path from "path";
import crypto from "crypto";
import "dotenv/config";

const storage = new GridFsStorage({
  url: process.env.MONGO_URL,
  file: (req, file) => {
    return new Promise((resolve, reject) => {
      crypto.randomBytes(16, (err, buf) => {
        if (err) {
          return reject(err);
        }

        const filename = buf.toString("hex") + path.extname(file.originalname);
        const fileInfo = {
          filename: filename,
          metadata: { userId: req.params.id },
          bucketName: "uploads",
        };
        req.filename = filename;

        resolve(fileInfo);
      });
    });
  },
});
const upload = multer({ storage });

export default upload;
