import { PrismaClient } from "@prisma/client";
import { hash } from "bcryptjs";
const db = new PrismaClient();
try {
  await db.product.upsert({
    where: { slug: "zoorvan-majoon" },
    update: {},
    create: {
      slug: "zoorvan-majoon",
      name: "Zoorvan Majoon",
      description:
        "A traditional herbal majoon for men, rooted in the familiar care of our heritage.",
      price: 2490,
      stock: 25,
      active: false,
    },
  });
  await db.setting.upsert({
    where: { id: "store" },
    update: {},
    create: { id: "store" },
  });
  if (process.env.ADMIN_EMAIL && process.env.ADMIN_PASSWORD) {
    if (process.env.ADMIN_PASSWORD.length < 8)
      throw new Error("Admin password must have at least 8 characters.");
    await db.user.upsert({
      where: { email: process.env.ADMIN_EMAIL.toLowerCase() },
      update: {},
      create: {
        name: "Store administrator",
        email: process.env.ADMIN_EMAIL.toLowerCase(),
        passwordHash: await hash(process.env.ADMIN_PASSWORD, 12),
        role: "ADMIN",
      },
    });
  }
  console.log(
    "Seed complete. Product remains inactive until reviewed in admin.",
  );
} finally {
  await db.$disconnect();
}
