import multer from "multer";
import path from "path";
import fs from "fs";
import { v4 as uuid } from "uuid";
import { env } from "../config/env";

const ALLOWED_AUDIO = ["audio/mpeg", "audio/mp3", "audio/wav"];
const ALLOWED_IMAGE = [
  "image/jpeg",
  "image/png",
  "image/webp",
  "image/gif",
];

const ensureDir = (dir: string) => {
  if (!fs.existsSync(dir)) {
    fs.mkdirSync(dir, { recursive: true });
  }
};

const storage = multer.diskStorage({
  destination: (_req, file, cb) => {
    const subdir = ALLOWED_AUDIO.includes(file.mimetype) ? "audio" : "images";
    const dir = path.join(env.UPLOAD_DIR, subdir);
    ensureDir(dir);
    cb(null, dir);
  },
  filename: (_req, file, cb) => {
    const ext = path.extname(file.originalname);
    cb(null, `${uuid()}${ext}`);
  },
});

export const upload = multer({
  storage,
  limits: { fileSize: 500 * 1024 * 1024 }, // 500MB
  fileFilter: (_req, file, cb) => {
    if ([...ALLOWED_AUDIO, ...ALLOWED_IMAGE].includes(file.mimetype)) {
      cb(null, true);
    } else {
      cb(new Error(`File type ${file.mimetype} not allowed`));
    }
  },
});
