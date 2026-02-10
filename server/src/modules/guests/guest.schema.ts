import { z } from "zod";

/**
 * @swagger
 * components:
 *   schemas:
 *     Guest:
 *       type: object
 *       properties:
 *         id:
 *           type: string
 *           format: uuid
 *         name:
 *           type: string
 *         bio:
 *           type: string
 *         photoUrl:
 *           type: string
 *         email:
 *           type: string
 *           format: email
 *         phone:
 *           type: string
 *         website:
 *           type: string
 *           format: uri
 *         twitter:
 *           type: string
 *         linkedin:
 *           type: string
 *         instagram:
 *           type: string
 *         notes:
 *           type: string
 *         createdAt:
 *           type: string
 *           format: date-time
 *         updatedAt:
 *           type: string
 *           format: date-time
 *     CreateGuest:
 *       type: object
 *       required:
 *         - name
 *       properties:
 *         name:
 *           type: string
 *         bio:
 *           type: string
 *         email:
 *           type: string
 *         phone:
 *           type: string
 *         website:
 *           type: string
 *         twitter:
 *           type: string
 *         linkedin:
 *           type: string
 *         instagram:
 *           type: string
 *         notes:
 *           type: string
 */

export const createGuestSchema = z.object({
  name: z.string().min(1, "Name is required").max(200),
  bio: z.string().max(5000).optional(),
  email: z.string().email().optional().or(z.literal("")),
  phone: z.string().max(30).optional(),
  website: z.string().url().optional().or(z.literal("")),
  twitter: z.string().max(100).optional(),
  linkedin: z.string().max(200).optional(),
  instagram: z.string().max(100).optional(),
  notes: z.string().optional(),
});

export const updateGuestSchema = createGuestSchema.partial();

export const guestQuerySchema = z.object({
  search: z.string().optional(),
  page: z.coerce.number().int().positive().default(1),
  limit: z.coerce.number().int().positive().max(100).default(20),
});

export type CreateGuestInput = z.infer<typeof createGuestSchema>;
export type UpdateGuestInput = z.infer<typeof updateGuestSchema>;
export type GuestQuery = z.infer<typeof guestQuerySchema>;
