import type { Options } from "swagger-jsdoc";

export const swaggerOptions: Options = {
  definition: {
    openapi: "3.0.0",
    info: {
      title: "Podcast Manager API",
      version: "1.0.0",
      description:
        "API for managing podcast guests, episodes, and digital assets",
    },
    servers: [{ url: "/api" }],
  },
  apis: ["./src/modules/**/*.router.ts", "./src/modules/**/*.schema.ts"],
};
