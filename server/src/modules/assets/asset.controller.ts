import { Request, Response, NextFunction } from "express";
import { assetService } from "./asset.service";
import { uploadMetadataSchema } from "./asset.schema";

export const assetController = {
  list: async (req: Request, res: Response, next: NextFunction) => {
    try {
      const result = await assetService.list(req.query as any);
      res.json(result);
    } catch (err) {
      next(err);
    }
  },

  getById: async (req: Request<{ id: string }>, res: Response, next: NextFunction) => {
    try {
      const asset = await assetService.getById(req.params.id as string);
      res.json(asset);
    } catch (err) {
      next(err);
    }
  },

  upload: async (req: Request, res: Response, next: NextFunction) => {
    try {
      if (!req.file) {
        return res.status(400).json({ error: "No file uploaded" });
      }

      const metadata = uploadMetadataSchema.parse(req.body);
      const asset = await assetService.create(req.file, metadata);
      res.status(201).json(asset);
    } catch (err) {
      next(err);
    }
  },

  delete: async (req: Request<{ id: string }>, res: Response, next: NextFunction) => {
    try {
      await assetService.delete(req.params.id as string);
      res.status(204).send();
    } catch (err) {
      next(err);
    }
  },

  download: async (req: Request<{ id: string }>, res: Response, next: NextFunction) => {
    try {
      const asset = await assetService.getById(req.params.id as string);
      const filePath = assetService.getFilePath(asset);
      res.download(filePath, asset.filename);
    } catch (err) {
      next(err);
    }
  },
};
