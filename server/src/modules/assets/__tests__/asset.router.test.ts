import request from "supertest";
import path from "path";
import fs from "fs";
import { app } from "../../../app";
import { prisma } from "../../../lib/prisma";

describe("Asset API", () => {
  let assetId: string;
  const testUploadDir = "./uploads/images";

  beforeAll(() => {
    // Ensure upload directories exist
    fs.mkdirSync("./uploads/audio", { recursive: true });
    fs.mkdirSync("./uploads/images", { recursive: true });
  });

  afterAll(async () => {
    await prisma.asset.deleteMany({});
    await prisma.$disconnect();
  });

  describe("POST /api/assets/upload", () => {
    it("should upload an image file", async () => {
      // Create a small test image file
      const testFilePath = path.join(__dirname, "test-image.png");
      // Create a minimal 1x1 PNG
      const pngBuffer = Buffer.from(
        "iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAYAAAAfFcSJAAAADUlEQVR42mNk+M9QDwADhgGAWjR9awAAAABJRU5ErkJggg==",
        "base64"
      );
      fs.writeFileSync(testFilePath, pngBuffer);

      const res = await request(app)
        .post("/api/assets/upload")
        .attach("file", testFilePath)
        .field("category", "GUEST_PHOTO")
        .field("description", "Test image")
        .expect(201);

      expect(res.body).toHaveProperty("id");
      expect(res.body.category).toBe("GUEST_PHOTO");
      expect(res.body.mimeType).toBe("image/png");
      assetId = res.body.id;

      // Cleanup test file
      fs.unlinkSync(testFilePath);
    });

    it("should return 400 with no file", async () => {
      await request(app)
        .post("/api/assets/upload")
        .field("category", "OTHER")
        .expect(400);
    });
  });

  describe("GET /api/assets", () => {
    it("should list assets", async () => {
      const res = await request(app).get("/api/assets").expect(200);

      expect(res.body).toHaveProperty("data");
      expect(Array.isArray(res.body.data)).toBe(true);
      expect(res.body.total).toBeGreaterThan(0);
    });

    it("should filter by category", async () => {
      const res = await request(app).get("/api/assets?category=GUEST_PHOTO").expect(200);

      res.body.data.forEach((asset: any) => {
        expect(asset.category).toBe("GUEST_PHOTO");
      });
    });
  });

  describe("GET /api/assets/:id", () => {
    it("should get asset by id", async () => {
      const res = await request(app).get(`/api/assets/${assetId}`).expect(200);

      expect(res.body.id).toBe(assetId);
      expect(res.body.filename).toBe("test-image.png");
    });
  });

  describe("DELETE /api/assets/:id", () => {
    it("should delete an asset", async () => {
      await request(app).delete(`/api/assets/${assetId}`).expect(204);
      await request(app).get(`/api/assets/${assetId}`).expect(404);
    });
  });
});
