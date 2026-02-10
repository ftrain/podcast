import { z } from "zod";

/**
 * @swagger
 * components:
 *   schemas:
 *     Asset:
 *       type: object
 *       properties:
 *         id:
 *           type: string
 *           format: uuid
 *         filename:
 *           type: string
 *         storedName:
 *           type: string
 *         mimeType:
 *           type: string
 *         size:
 *           type: integer
 *         category:
 *           type: string
 *           enum: [AUDIO, COVER_ART, GUEST_PHOTO, EPISODE_ARTWORK, OTHER]
 *         episodeId:
 *           type: string
 *           format: uuid
 *         description:
 *           type: string
 *         createdAt:
 *           type: string
 *           format: date-time
 */

const assetCategories = [
  "AUDIO",
  "COVER_ART",
  "GUEST_PHOTO",
  "EPISODE_ARTWORK",
  "OTHER",
] as const;

export const assetQuerySchema = z.object({
  category: z.enum(assetCategories).optional(),
  episodeId: z.string().uuid().optional(),
  page: z.coerce.number().int().positive().default(1),
  limit: z.coerce.number().int().positive().max(100).default(20),
});

export const uploadMetadataSchema = z.object({
  category: z.enum(assetCategories).default("OTHER"),
  episodeId: z.string().uuid().optional().or(z.literal("")),
  description: z.string().max(1000).optional(),
});

export type AssetQuery = z.infer<typeof assetQuerySchema>;
export type UploadMetadata = z.infer<typeof uploadMetadataSchema>;
