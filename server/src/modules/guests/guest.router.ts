import { Router } from "express";
import { guestController } from "./guest.controller";
import { validate } from "../../middleware/validate";
import {
  createGuestSchema,
  updateGuestSchema,
  guestQuerySchema,
} from "./guest.schema";

const router = Router();

/**
 * @swagger
 * /guests:
 *   get:
 *     summary: List all guests
 *     tags: [Guests]
 *     parameters:
 *       - in: query
 *         name: search
 *         schema:
 *           type: string
 *         description: Search guests by name
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
 *         description: Paginated list of guests
 */
router.get("/", validate(guestQuerySchema, "query"), guestController.list);

/**
 * @swagger
 * /guests/{id}:
 *   get:
 *     summary: Get a guest by ID
 *     tags: [Guests]
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *           format: uuid
 *     responses:
 *       200:
 *         description: Guest details with appearances
 *       404:
 *         description: Guest not found
 */
router.get("/:id", guestController.getById);

/**
 * @swagger
 * /guests:
 *   post:
 *     summary: Create a new guest
 *     tags: [Guests]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             $ref: '#/components/schemas/CreateGuest'
 *     responses:
 *       201:
 *         description: Guest created
 *       400:
 *         description: Validation error
 */
router.post("/", validate(createGuestSchema), guestController.create);

/**
 * @swagger
 * /guests/{id}:
 *   patch:
 *     summary: Update a guest
 *     tags: [Guests]
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
 *             $ref: '#/components/schemas/CreateGuest'
 *     responses:
 *       200:
 *         description: Guest updated
 *       404:
 *         description: Guest not found
 */
router.patch("/:id", validate(updateGuestSchema), guestController.update);

/**
 * @swagger
 * /guests/{id}:
 *   delete:
 *     summary: Delete a guest
 *     tags: [Guests]
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *           format: uuid
 *     responses:
 *       204:
 *         description: Guest deleted
 *       404:
 *         description: Guest not found
 */
router.delete("/:id", guestController.delete);

export { router as guestRouter };
