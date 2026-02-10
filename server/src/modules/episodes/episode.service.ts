import { prisma } from "../../lib/prisma";
import {
  CreateEpisodeInput,
  UpdateEpisodeInput,
  EpisodeQuery,
  AssignGuestInput,
} from "./episode.schema";
import { EpisodeStatus } from "@prisma/client";

export class EpisodeService {
  async list(query: EpisodeQuery) {
    const { search, status, page, limit } = query;
    const where: any = {};

    if (search) {
      where.title = { contains: search, mode: "insensitive" };
    }
    if (status) {
      where.status = status;
    }

    const [episodes, total] = await Promise.all([
      prisma.episode.findMany({
        where,
        skip: (page - 1) * limit,
        take: limit,
        orderBy: { createdAt: "desc" },
        include: {
          guests: { include: { guest: true } },
          _count: { select: { assets: true } },
        },
      }),
      prisma.episode.count({ where }),
    ]);

    return {
      data: episodes,
      total,
      page,
      limit,
      totalPages: Math.ceil(total / limit),
    };
  }

  async getById(id: string) {
    return prisma.episode.findUniqueOrThrow({
      where: { id },
      include: {
        guests: { include: { guest: true } },
        assets: true,
      },
    });
  }

  async create(data: CreateEpisodeInput) {
    return prisma.episode.create({ data: data as any });
  }

  async update(id: string, data: UpdateEpisodeInput) {
    const updateData: any = { ...data };

    // Auto-set publishedAt when status changes to PUBLISHED
    if (data.status === "PUBLISHED") {
      const existing = await prisma.episode.findUniqueOrThrow({
        where: { id },
      });
      if (existing.status !== "PUBLISHED") {
        updateData.publishedAt = new Date();
      }
    }

    return prisma.episode.update({ where: { id }, data: updateData });
  }

  async delete(id: string) {
    return prisma.episode.delete({ where: { id } });
  }

  async assignGuest(episodeId: string, data: AssignGuestInput) {
    return prisma.episodeGuest.create({
      data: {
        episodeId,
        guestId: data.guestId,
        role: data.role,
      },
      include: { guest: true },
    });
  }

  async removeGuest(episodeId: string, guestId: string) {
    return prisma.episodeGuest.delete({
      where: {
        episodeId_guestId: { episodeId, guestId },
      },
    });
  }

  async pipeline() {
    const statuses: EpisodeStatus[] = [
      "IDEA",
      "PLANNED",
      "RECORDING",
      "EDITING",
      "PUBLISHED",
    ];

    const groups = await Promise.all(
      statuses.map(async (status) => {
        const episodes = await prisma.episode.findMany({
          where: { status },
          orderBy: { updatedAt: "desc" },
          include: {
            guests: { include: { guest: true } },
            _count: { select: { assets: true } },
          },
        });
        return { status, episodes, count: episodes.length };
      })
    );

    return groups;
  }
}

export const episodeService = new EpisodeService();
