import { Router } from "express";
import { assetController } from "./asset.controller";
import { validate } from "../../middleware/validate";
import { assetQuerySchema } from "./asset.schema";
import { upload } from "../../lib/upload";

const router = Router();

/**
 * @swagger
 * /assets:
 *   get:
 *     summary: List all assets
 *     tags: [Assets]
 *     parameters:
 *       - in: query
 *         name: category
 *         schema:
 *           type: string
 *           enum: [AUDIO, COVER_ART, GUEST_PHOTO, EPISODE_ARTWORK, OTHER]
 *       - in: query
 *         name: episodeId
 *         schema:
 *           type: string
 *           format: uuid
 *       - in: query
 *         name: page
 *         schema:
 *           type: integer
 *           default: 1
 *       - in: query
 *         name: limit
 *         schema:
 *           type: integer
 *           default: 20
 *     responses:
 *       200:
 *         description: Paginated list of assets
 */
router.get("/", validate(assetQuerySchema, "query"), assetController.list);

/**
 * @swagger
 * /assets/{id}:
 *   get:
 *     summary: Get an asset by ID
 *     tags: [Assets]
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *           format: uuid
 *     responses:
 *       200:
 *         description: Asset metadata
 *       404:
 *         description: Asset not found
 */
router.get("/:id", assetController.getById);

/**
 * @swagger
 * /assets/upload:
 *   post:
 *     summary: Upload a file
 *     tags: [Assets]
 *     requestBody:
 *       required: true
 *       content:
 *         multipart/form-data:
 *           schema:
 *             type: object
 *             required:
 *               - file
 *             properties:
 *               file:
 *                 type: string
 *                 format: binary
 *               category:
 *                 type: string
 *                 enum: [AUDIO, COVER_ART, GUEST_PHOTO, EPISODE_ARTWORK, OTHER]
 *               episodeId:
 *                 type: string
 *                 format: uuid
 *               description:
 *                 type: string
 *     responses:
 *       201:
 *         description: File uploaded successfully
 *       400:
 *         description: No file provided
 *       413:
 *         description: File too large
 *       415:
 *         description: File type not allowed
 */
router.post("/upload", upload.single("file"), assetController.upload);

/**
 * @swagger
 * /assets/{id}:
 *   delete:
 *     summary: Delete an asset
 *     tags: [Assets]
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *           format: uuid
 *     responses:
 *       204:
 *         description: Asset deleted
 *       404:
 *         description: Asset not found
 */
router.delete("/:id", assetController.delete);

/**
 * @swagger
 * /assets/{id}/download:
 *   get:
 *     summary: Download an asset file
 *     tags: [Assets]
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *           format: uuid
 *     responses:
 *       200:
 *         description: File download
 *       404:
 *         description: Asset not found
 */
router.get("/:id/download", assetController.download);

export { router as assetRouter };
