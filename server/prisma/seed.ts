import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

async function main() {
  // Create sample guests
  const guest1 = await prisma.guest.create({
    data: {
      name: "Jane Smith",
      bio: "Tech entrepreneur and AI researcher with 15 years of industry experience.",
      email: "jane@example.com",
      twitter: "@janesmith",
      linkedin: "janesmith",
    },
  });

  const guest2 = await prisma.guest.create({
    data: {
      name: "Bob Johnson",
      bio: "Bestselling author and public speaker on leadership and innovation.",
      email: "bob@example.com",
      twitter: "@bobjohnson",
      website: "https://bobjohnson.com",
    },
  });

  const guest3 = await prisma.guest.create({
    data: {
      name: "Alice Chen",
      bio: "Open-source advocate and senior engineer at a leading tech company.",
      email: "alice@example.com",
      twitter: "@alicechen",
      instagram: "alicechen_dev",
    },
  });

  // Create sample episodes
  const ep1 = await prisma.episode.create({
    data: {
      title: "The Future of AI in Everyday Life",
      description:
        "Exploring how artificial intelligence is shaping our daily routines and what to expect in the next decade.",
      status: "PUBLISHED",
      episodeNum: 1,
      publishedAt: new Date("2025-12-01"),
    },
  });

  const ep2 = await prisma.episode.create({
    data: {
      title: "Leadership Lessons from Silicon Valley",
      description:
        "Bob Johnson shares his insights on what makes great leaders in the tech industry.",
      status: "EDITING",
      episodeNum: 2,
      scheduledAt: new Date("2026-02-15"),
    },
  });

  const ep3 = await prisma.episode.create({
    data: {
      title: "Open Source: Building the Future Together",
      description:
        "A deep dive into the open-source movement and its impact on modern software development.",
      status: "PLANNED",
      episodeNum: 3,
      scheduledAt: new Date("2026-03-01"),
    },
  });

  const ep4 = await prisma.episode.create({
    data: {
      title: "The Creator Economy in 2026",
      description: "How creators are monetizing their content in new ways.",
      status: "IDEA",
    },
  });

  const ep5 = await prisma.episode.create({
    data: {
      title: "Cybersecurity for Everyone",
      description:
        "Practical tips for staying safe online in an increasingly connected world.",
      status: "IDEA",
    },
  });

  // Assign guests to episodes
  await prisma.episodeGuest.createMany({
    data: [
      { episodeId: ep1.id, guestId: guest1.id, role: "guest" },
      { episodeId: ep2.id, guestId: guest2.id, role: "guest" },
      { episodeId: ep3.id, guestId: guest3.id, role: "guest" },
      { episodeId: ep3.id, guestId: guest1.id, role: "co-host" },
    ],
  });

  console.log("Seed data created successfully");
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
