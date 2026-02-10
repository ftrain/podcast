import { prisma } from "../../lib/prisma";
import { CreateGuestInput, UpdateGuestInput, GuestQuery } from "./guest.schema";

export class GuestService {
  async list(query: GuestQuery) {
    const { search, page, limit } = query;
    const where = search
      ? { name: { contains: search, mode: "insensitive" as const } }
      : {};

    const [guests, total] = await Promise.all([
      prisma.guest.findMany({
        where,
        skip: (page - 1) * limit,
        take: limit,
        orderBy: { createdAt: "desc" },
        include: {
          _count: { select: { appearances: true } },
        },
      }),
      prisma.guest.count({ where }),
    ]);

    return {
      data: guests,
      total,
      page,
      limit,
      totalPages: Math.ceil(total / limit),
    };
  }

  async getById(id: string) {
    return prisma.guest.findUniqueOrThrow({
      where: { id },
      include: {
        appearances: {
          include: {
            episode: true,
          },
          orderBy: { createdAt: "desc" },
        },
      },
    });
  }

  async create(data: CreateGuestInput) {
    return prisma.guest.create({ data });
  }

  async update(id: string, data: UpdateGuestInput) {
    return prisma.guest.update({ where: { id }, data });
  }

  async delete(id: string) {
    return prisma.guest.delete({ where: { id } });
  }
}

export const guestService = new GuestService();
