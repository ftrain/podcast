import request from "supertest";
import { app } from "../app";

describe("Health Check", () => {
  it("GET /api/health should return ok", async () => {
    const res = await request(app).get("/api/health").expect(200);
    expect(res.body.status).toBe("ok");
    expect(res.body).toHaveProperty("timestamp");
  });

  it("should return 404 for unknown routes", async () => {
    const res = await request(app).get("/api/nonexistent").expect(404);
    expect(res.body.error).toBe("Route not found");
  });
});
