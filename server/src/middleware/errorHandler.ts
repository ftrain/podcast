import { Request, Response, NextFunction } from "express";
import { Prisma } from "@prisma/client";

export const errorHandler = (
  err: Error,
  _req: Request,
  res: Response,
  _next: NextFunction
) => {
  // Prisma not-found
  if (
    err instanceof Prisma.PrismaClientKnownRequestError &&
    err.code === "P2025"
  ) {
    return res.status(404).json({ error: "Resource not found" });
  }

  // Prisma unique constraint
  if (
    err instanceof Prisma.PrismaClientKnownRequestError &&
    err.code === "P2002"
  ) {
    return res.status(409).json({ error: "Resource already exists" });
  }

  // Multer file size
  if (err.message?.includes("File too large")) {
    return res.status(413).json({ error: "File too large" });
  }

  // Multer file type
  if (err.message?.includes("not allowed")) {
    return res.status(415).json({ error: err.message });
  }

  console.error(err);
  res.status(500).json({ error: "Internal server error" });
};
