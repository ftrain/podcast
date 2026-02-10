import { Request, Response, NextFunction } from "express";
import { episodeService } from "./episode.service";

export const episodeController = {
  list: async (req: Request, res: Response, next: NextFunction) => {
    try {
      const result = await episodeService.list(req.query as any);
      res.json(result);
    } catch (err) {
      next(err);
    }
  },

  getById: async (req: Request<{ id: string }>, res: Response, next: NextFunction) => {
    try {
      const episode = await episodeService.getById(req.params.id as string);
      res.json(episode);
    } catch (err) {
      next(err);
    }
  },

  create: async (req: Request, res: Response, next: NextFunction) => {
    try {
      const episode = await episodeService.create(req.body);
      res.status(201).json(episode);
    } catch (err) {
      next(err);
    }
  },

  update: async (req: Request<{ id: string }>, res: Response, next: NextFunction) => {
    try {
      const episode = await episodeService.update(req.params.id as string, req.body);
      res.json(episode);
    } catch (err) {
      next(err);
    }
  },

  delete: async (req: Request<{ id: string }>, res: Response, next: NextFunction) => {
    try {
      await episodeService.delete(req.params.id as string);
      res.status(204).send();
    } catch (err) {
      next(err);
    }
  },

  assignGuest: async (req: Request<{ id: string }>, res: Response, next: NextFunction) => {
    try {
      const result = await episodeService.assignGuest(req.params.id as string, req.body);
      res.status(201).json(result);
    } catch (err) {
      next(err);
    }
  },

  removeGuest: async (req: Request<{ id: string; guestId: string }>, res: Response, next: NextFunction) => {
    try {
      await episodeService.removeGuest(req.params.id as string, req.params.guestId as string);
      res.status(204).send();
    } catch (err) {
      next(err);
    }
  },

  pipeline: async (_req: Request, res: Response, next: NextFunction) => {
    try {
      const result = await episodeService.pipeline();
      res.json(result);
    } catch (err) {
      next(err);
    }
  },
};
