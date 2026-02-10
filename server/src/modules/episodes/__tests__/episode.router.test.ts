import request from "supertest";
import { app } from "../../../app";
import { prisma } from "../../../lib/prisma";

describe("Episode API", () => {
  let episodeId: string;
  let guestId: string;

  beforeAll(async () => {
    // Create a guest for assignment tests
    const guest = await prisma.guest.create({
      data: { name: "Episode Test Guest", email: "epguest@example.com" },
    });
    guestId = guest.id;
  });

  afterAll(async () => {
    await prisma.episodeGuest.deleteMany({});
    await prisma.asset.deleteMany({});
    await prisma.episode.deleteMany({});
    await prisma.guest.deleteMany({});
    await prisma.$disconnect();
  });

  describe("POST /api/episodes", () => {
    it("should create a new episode", async () => {
      const res = await request(app)
        .post("/api/episodes")
        .send({ title: "Test Episode", description: "A test episode", status: "IDEA" })
        .expect(201);

      expect(res.body).toHaveProperty("id");
      expect(res.body.title).toBe("Test Episode");
      expect(res.body.status).toBe("IDEA");
      episodeId = res.body.id;
    });

    it("should return 400 for missing title", async () => {
      await request(app)
        .post("/api/episodes")
        .send({ description: "No title" })
        .expect(400);
    });
  });

  describe("GET /api/episodes", () => {
    it("should list episodes", async () => {
      const res = await request(app).get("/api/episodes").expect(200);

      expect(res.body).toHaveProperty("data");
      expect(Array.isArray(res.body.data)).toBe(true);
      expect(res.body.total).toBeGreaterThan(0);
    });

    it("should filter by status", async () => {
      const res = await request(app).get("/api/episodes?status=IDEA").expect(200);

      res.body.data.forEach((ep: any) => {
        expect(ep.status).toBe("IDEA");
      });
    });
  });

  describe("GET /api/episodes/:id", () => {
    it("should get an episode by id", async () => {
      const res = await request(app).get(`/api/episodes/${episodeId}`).expect(200);

      expect(res.body.id).toBe(episodeId);
      expect(res.body).toHaveProperty("guests");
      expect(res.body).toHaveProperty("assets");
    });
  });

  describe("PATCH /api/episodes/:id", () => {
    it("should update an episode", async () => {
      const res = await request(app)
        .patch(`/api/episodes/${episodeId}`)
        .send({ status: "PLANNED", episodeNum: 42 })
        .expect(200);

      expect(res.body.status).toBe("PLANNED");
      expect(res.body.episodeNum).toBe(42);
    });

    it("should auto-set publishedAt when status changes to PUBLISHED", async () => {
      const res = await request(app)
        .patch(`/api/episodes/${episodeId}`)
        .send({ status: "PUBLISHED" })
        .expect(200);

      expect(res.body.status).toBe("PUBLISHED");
      expect(res.body.publishedAt).toBeTruthy();
    });
  });

  describe("Guest assignment", () => {
    it("POST /api/episodes/:id/guests should assign a guest", async () => {
      const res = await request(app)
        .post(`/api/episodes/${episodeId}/guests`)
        .send({ guestId, role: "guest" })
        .expect(201);

      expect(res.body).toHaveProperty("guest");
      expect(res.body.guest.id).toBe(guestId);
    });

    it("should return 409 for duplicate assignment", async () => {
      await request(app)
        .post(`/api/episodes/${episodeId}/guests`)
        .send({ guestId, role: "guest" })
        .expect(409);
    });

    it("DELETE /api/episodes/:id/guests/:guestId should remove a guest", async () => {
      await request(app)
        .delete(`/api/episodes/${episodeId}/guests/${guestId}`)
        .expect(204);
    });
  });

  describe("GET /api/episodes/pipeline", () => {
    it("should return episodes grouped by status", async () => {
      const res = await request(app).get("/api/episodes/pipeline").expect(200);

      expect(Array.isArray(res.body)).toBe(true);
      expect(res.body.length).toBe(5);
      res.body.forEach((group: any) => {
        expect(group).toHaveProperty("status");
        expect(group).toHaveProperty("episodes");
        expect(group).toHaveProperty("count");
      });
    });
  });

  describe("DELETE /api/episodes/:id", () => {
    it("should delete an episode", async () => {
      await request(app).delete(`/api/episodes/${episodeId}`).expect(204);
      await request(app).get(`/api/episodes/${episodeId}`).expect(404);
    });
  });
});
