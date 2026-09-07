import { auth } from "@/auth";
import { db, databaseConfigured } from "./db";
export async function getAdmin() {
  if (!databaseConfigured) return null;
  const session = await auth();
  if (!session?.user?.id) return null;
  return db.user.findFirst({
    where: { id: session.user.id, role: "ADMIN" },
    select: { id: true, name: true, email: true, role: true },
  });
}
export const adminModules = [
  "overview",
  "orders",
  "products",
  "inventory",
  "customers",
  "coupons",
  "reviews",
  "content",
  "settings",
  "staff",
  "reports",
  "activity",
];
export async function adminData(module) {
  switch (module) {
    case "orders":
      return db.order.findMany({ orderBy: { createdAt: "desc" }, take: 100 });
    case "products":
    case "inventory":
      return db.product.findMany({ orderBy: { name: "asc" } });
    case "customers":
      return db.user.findMany({
        where: { role: "CUSTOMER" },
        select: {
          id: true,
          name: true,
          email: true,
          phone: true,
          city: true,
          createdAt: true,
          _count: { select: { orders: true } },
        },
        orderBy: { createdAt: "desc" },
        take: 100,
      });
    case "staff":
      return db.user.findMany({
        where: { role: "ADMIN" },
        select: {
          id: true,
          name: true,
          email: true,
          role: true,
          createdAt: true,
        },
      });
    case "coupons":
      return db.coupon.findMany({ orderBy: { code: "asc" }, take: 100 });
    case "reviews":
      return db.review.findMany({ orderBy: { createdAt: "desc" }, take: 100 });
    case "content":
      return db.content.findMany({ orderBy: { slug: "asc" } });
    case "settings":
      return [
        await db.setting.upsert({
          where: { id: "store" },
          update: {},
          create: { id: "store" },
        }),
      ];
    case "activity":
      return db.auditLog.findMany({
        orderBy: { createdAt: "desc" },
        take: 100,
      });
    default: {
      const [orders, customers, products, revenue, pending, delivered] =
        await Promise.all([
          db.order.count(),
          db.user.count({ where: { role: "CUSTOMER" } }),
          db.product.findMany(),
          db.order.aggregate({
            where: { status: "DELIVERED" },
            _sum: { total: true },
          }),
          db.order.count({ where: { status: "PENDING" } }),
          db.order.count({ where: { status: "DELIVERED" } }),
        ]);
      return {
        orders,
        customers,
        products,
        revenue: revenue._sum.total || 0,
        pending,
        delivered,
      };
    }
  }
}
