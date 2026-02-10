import request from "supertest";
import { app } from "../../../app";
import { prisma } from "../../../lib/prisma";

describe("Guest API", () => {
  let guestId: string;

  afterAll(async () => {
    // Clean up test data
    await prisma.episodeGuest.deleteMany({});
    await prisma.guest.deleteMany({});
    await prisma.$disconnect();
  });

  describe("POST /api/guests", () => {
    it("should create a new guest", async () => {
      const res = await request(app)
        .post("/api/guests")
        .send({ name: "Test Guest", email: "test@example.com", bio: "A test guest" })
        .expect(201);

      expect(res.body).toHaveProperty("id");
      expect(res.body.name).toBe("Test Guest");
      expect(res.body.email).toBe("test@example.com");
      guestId = res.body.id;
    });

    it("should return 400 for missing name", async () => {
      const res = await request(app)
        .post("/api/guests")
        .send({ email: "no-name@example.com" })
        .expect(400);

      expect(res.body.error).toBe("Validation failed");
    });
  });

  describe("GET /api/guests", () => {
    it("should list guests with pagination", async () => {
      const res = await request(app).get("/api/guests").expect(200);

      expect(res.body).toHaveProperty("data");
      expect(res.body).toHaveProperty("total");
      expect(res.body).toHaveProperty("page");
      expect(res.body).toHaveProperty("totalPages");
      expect(Array.isArray(res.body.data)).toBe(true);
    });

    it("should filter guests by search", async () => {
      const res = await request(app).get("/api/guests?search=Test").expect(200);

      expect(res.body.data.length).toBeGreaterThan(0);
      expect(res.body.data[0].name).toContain("Test");
    });
  });

  describe("GET /api/guests/:id", () => {
    it("should get a guest by id", async () => {
      const res = await request(app).get(`/api/guests/${guestId}`).expect(200);

      expect(res.body.id).toBe(guestId);
      expect(res.body.name).toBe("Test Guest");
      expect(res.body).toHaveProperty("appearances");
    });

    it("should return 404 for non-existent guest", async () => {
      await request(app)
        .get("/api/guests/00000000-0000-0000-0000-000000000000")
        .expect(404);
    });
  });

  describe("PATCH /api/guests/:id", () => {
    it("should update a guest", async () => {
      const res = await request(app)
        .patch(`/api/guests/${guestId}`)
        .send({ name: "Updated Guest", twitter: "@updated" })
        .expect(200);

      expect(res.body.name).toBe("Updated Guest");
      expect(res.body.twitter).toBe("@updated");
    });
  });

  describe("DELETE /api/guests/:id", () => {
    it("should delete a guest", async () => {
      await request(app).delete(`/api/guests/${guestId}`).expect(204);

      await request(app).get(`/api/guests/${guestId}`).expect(404);
    });
  });
});
