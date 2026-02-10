import { Request, Response, NextFunction } from "express";
import { guestService } from "./guest.service";

export const guestController = {
  list: async (req: Request, res: Response, next: NextFunction) => {
    try {
      const result = await guestService.list(req.query as any);
      res.json(result);
    } catch (err) {
      next(err);
    }
  },

  getById: async (req: Request<{ id: string }>, res: Response, next: NextFunction) => {
    try {
      const guest = await guestService.getById(req.params.id as string);
      res.json(guest);
    } catch (err) {
      next(err);
    }
  },

  create: async (req: Request, res: Response, next: NextFunction) => {
    try {
      const guest = await guestService.create(req.body);
      res.status(201).json(guest);
    } catch (err) {
      next(err);
    }
  },

  update: async (req: Request<{ id: string }>, res: Response, next: NextFunction) => {
    try {
      const guest = await guestService.update(req.params.id as string, req.body);
      res.json(guest);
    } catch (err) {
      next(err);
    }
  },

  delete: async (req: Request<{ id: string }>, res: Response, next: NextFunction) => {
    try {
      await guestService.delete(req.params.id as string);
      res.status(204).send();
    } catch (err) {
      next(err);
    }
  },
};
