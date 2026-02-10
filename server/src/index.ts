import dotenv from "dotenv";
dotenv.config({ path: "../.env" });

import { app } from "./app";
import { env } from "./config/env";

const port = env.PORT;

app.listen(port, () => {
  console.log(`Podcast Manager API running on http://localhost:${port}`);
  console.log(`Swagger docs at http://localhost:${port}/api/docs`);
});
