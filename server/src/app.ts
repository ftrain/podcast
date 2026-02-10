import express from "express";
import cors from "cors";
import swaggerUi from "swagger-ui-express";
import swaggerJSDoc from "swagger-jsdoc";
import path from "path";
import { swaggerOptions } from "./config/swagger";
import { guestRouter } from "./modules/guests/guest.router";
import { episodeRouter } from "./modules/episodes/episode.router";
import { assetRouter } from "./modules/assets/asset.router";
import { errorHandler } from "./middleware/errorHandler";
import { notFound } from "./middleware/notFound";
import { env } from "./config/env";

const app = express();

app.use(cors());
app.use(express.json());
app.use(
  "/uploads",
  express.static(path.resolve(env.UPLOAD_DIR))
);

const swaggerSpec = swaggerJSDoc(swaggerOptions);
app.use("/api/docs", swaggerUi.serve, swaggerUi.setup(swaggerSpec));
app.get("/api/docs.json", (_req, res) => {
  res.json(swaggerSpec);
});

app.use("/api/guests", guestRouter);
app.use("/api/episodes", episodeRouter);
app.use("/api/assets", assetRouter);

// Health check
app.get("/api/health", (_req, res) => {
  res.json({ status: "ok", timestamp: new Date().toISOString() });
});

app.use(notFound);
app.use(errorHandler);

export { app };
