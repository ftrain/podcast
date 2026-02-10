import { Router } from "express";
import { episodeController } from "./episode.controller";
import { validate } from "../../middleware/validate";
import {
  createEpisodeSchema,
  updateEpisodeSchema,
  episodeQuerySchema,
  assignGuestSchema,
} from "./episode.schema";

const router = Router();

/**
 * @swagger
 * /episodes/pipeline:
 *   get:
 *     summary: Get episodes grouped by status for pipeline view
 *     tags: [Episodes]
 *     responses:
 *       200:
 *         description: Episodes grouped by status
 */
router.get("/pipeline", episodeController.pipeline);

/**
 * @swagger
 * /episodes:
 *   get:
 *     summary: List all episodes
 *     tags: [Episodes]
 *     parameters:
 *       - in: query
 *         name: search
 *         schema:
 *           type: string
 *       - in: query
 *         name: status
 *         schema:
 *           type: string
 *           enum: [IDEA, PLANNED, RECORDING, EDITING, PUBLISHED]
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
 *         description: Paginated list of episodes
 */
router.get(
  "/",
  validate(episodeQuerySchema, "query"),
  episodeController.list
);

/**
 * @swagger
 * /episodes/{id}:
 *   get:
 *     summary: Get an episode by ID
 *     tags: [Episodes]
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *           format: uuid
 *     responses:
 *       200:
 *         description: Episode details with guests and assets
 *       404:
 *         description: Episode not found
 */
router.get("/:id", episodeController.getById);

/**
 * @swagger
 * /episodes:
 *   post:
 *     summary: Create a new episode
 *     tags: [Episodes]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             $ref: '#/components/schemas/CreateEpisode'
 *     responses:
 *       201:
 *         description: Episode created
 */
router.post(
  "/",
  validate(createEpisodeSchema),
  episodeController.create
);

/**
 * @swagger
 * /episodes/{id}:
 *   patch:
 *     summary: Update an episode
 *     tags: [Episodes]
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *           format: uuid
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             $ref: '#/components/schemas/CreateEpisode'
 *     responses:
 *       200:
 *         description: Episode updated
 */
router.patch(
  "/:id",
  validate(updateEpisodeSchema),
  episodeController.update
);

/**
 * @swagger
 * /episodes/{id}:
 *   delete:
 *     summary: Delete an episode
 *     tags: [Episodes]
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *           format: uuid
 *     responses:
 *       204:
 *         description: Episode deleted
 */
router.delete("/:id", episodeController.delete);

/**
 * @swagger
 * /episodes/{id}/guests:
 *   post:
 *     summary: Assign a guest to an episode
 *     tags: [Episodes]
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *           format: uuid
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             $ref: '#/components/schemas/AssignGuest'
 *     responses:
 *       201:
 *         description: Guest assigned to episode
 */
router.post(
  "/:id/guests",
  validate(assignGuestSchema),
  episodeController.assignGuest
);

/**
 * @swagger
 * /episodes/{id}/guests/{guestId}:
 *   delete:
 *     summary: Remove a guest from an episode
 *     tags: [Episodes]
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *           format: uuid
 *       - in: path
 *         name: guestId
 *         required: true
 *         schema:
 *           type: string
 *           format: uuid
 *     responses:
 *       204:
 *         description: Guest removed from episode
 */
router.delete("/:id/guests/:guestId", episodeController.removeGuest);

export { router as episodeRouter };
