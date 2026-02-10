import { z } from "zod";

/**
 * @swagger
 * components:
 *   schemas:
 *     Episode:
 *       type: object
 *       properties:
 *         id:
 *           type: string
 *           format: uuid
 *         title:
 *           type: string
 *         description:
 *           type: string
 *         status:
 *           type: string
 *           enum: [IDEA, PLANNED, RECORDING, EDITING, PUBLISHED]
 *         episodeNum:
 *           type: integer
 *         scheduledAt:
 *           type: string
 *           format: date-time
 *         publishedAt:
 *           type: string
 *           format: date-time
 *         notes:
 *           type: string
 *         createdAt:
 *           type: string
 *           format: date-time
 *         updatedAt:
 *           type: string
 *           format: date-time
 *     CreateEpisode:
 *       type: object
 *       required:
 *         - title
 *       properties:
 *         title:
 *           type: string
 *         description:
 *           type: string
 *         status:
 *           type: string
 *           enum: [IDEA, PLANNED, RECORDING, EDITING, PUBLISHED]
 *         episodeNum:
 *           type: integer
 *         scheduledAt:
 *           type: string
 *           format: date-time
 *         notes:
 *           type: string
 *     AssignGuest:
 *       type: object
 *       required:
 *         - guestId
 *       properties:
 *         guestId:
 *           type: string
 *           format: uuid
 *         role:
 *           type: string
 *           default: guest
 */

const episodeStatuses = [
  "IDEA",
  "PLANNED",
  "RECORDING",
  "EDITING",
  "PUBLISHED",
] as const;

export const createEpisodeSchema = z.object({
  title: z.string().min(1, "Title is required").max(500),
  description: z.string().max(10000).optional(),
  status: z.enum(episodeStatuses).optional(),
  episodeNum: z.number().int().positive().optional(),
  scheduledAt: z.coerce.date().optional(),
  notes: z.string().optional(),
});

export const updateEpisodeSchema = createEpisodeSchema.partial();

export const episodeQuerySchema = z.object({
  search: z.string().optional(),
  status: z.enum(episodeStatuses).optional(),
  page: z.coerce.number().int().positive().default(1),
  limit: z.coerce.number().int().positive().max(100).default(20),
});

export const assignGuestSchema = z.object({
  guestId: z.string().uuid(),
  role: z.string().max(50).default("guest"),
});

export type CreateEpisodeInput = z.infer<typeof createEpisodeSchema>;
export type UpdateEpisodeInput = z.infer<typeof updateEpisodeSchema>;
export type EpisodeQuery = z.infer<typeof episodeQuerySchema>;
export type AssignGuestInput = z.infer<typeof assignGuestSchema>;
