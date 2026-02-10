import path from "path";
import fs from "fs";
import { prisma } from "../../lib/prisma";
import { AssetQuery, UploadMetadata } from "./asset.schema";
import { env } from "../../config/env";

export class AssetService {
  async list(query: AssetQuery) {
    const { category, episodeId, page, limit } = query;
    const where: any = {};

    if (category) where.category = category;
    if (episodeId) where.episodeId = episodeId;

    const [assets, total] = await Promise.all([
      prisma.asset.findMany({
        where,
        skip: (page - 1) * limit,
        take: limit,
        orderBy: { createdAt: "desc" },
        include: { episode: { select: { id: true, title: true } } },
      }),
      prisma.asset.count({ where }),
    ]);

    return {
      data: assets,
      total,
      page,
      limit,
      totalPages: Math.ceil(total / limit),
    };
  }

  async getById(id: string) {
    return prisma.asset.findUniqueOrThrow({
      where: { id },
      include: { episode: { select: { id: true, title: true } } },
    });
  }

  async create(
    file: Express.Multer.File,
    metadata: UploadMetadata
  ) {
    return prisma.asset.create({
      data: {
        filename: file.originalname,
        storedName: file.filename,
        mimeType: file.mimetype,
        size: file.size,
        category: metadata.category,
        episodeId: metadata.episodeId || null,
        description: metadata.description,
      },
    });
  }

  async delete(id: string) {
    const asset = await prisma.asset.findUniqueOrThrow({ where: { id } });

    // Delete file from disk
    const isAudio = asset.mimeType.startsWith("audio/");
    const filePath = path.join(
      env.UPLOAD_DIR,
      isAudio ? "audio" : "images",
      asset.storedName
    );

    if (fs.existsSync(filePath)) {
      fs.unlinkSync(filePath);
    }

    return prisma.asset.delete({ where: { id } });
  }

  getFilePath(asset: { storedName: string; mimeType: string }) {
    const isAudio = asset.mimeType.startsWith("audio/");
    return path.join(
      env.UPLOAD_DIR,
      isAudio ? "audio" : "images",
      asset.storedName
    );
  }
}

export const assetService = new AssetService();
