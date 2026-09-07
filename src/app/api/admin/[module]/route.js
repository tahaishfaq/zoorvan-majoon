import * as yup from "yup";
import { hash } from "bcryptjs";
import { db } from "@/lib/db";
import { getAdmin } from "@/lib/admin";
import { sameOrigin, errorResponse } from "@/lib/security";
import { statuses } from "@/lib/catalog";
const text = yup.string().trim();
const schemas = {
  products: yup.object({
    name: text.max(100).required(),
    description: text.max(1500).required(),
    price: yup.number().integer().min(1).max(1000000).required(),
    weight: text.max(40).required(),
    active: yup.boolean().required(),
  }),
  inventory: yup.object({
    stock: yup.number().integer().min(0).max(100000).required(),
  }),
  orders: yup.object({
    status: text.oneOf(statuses).required(),
    courier: text.max(80).default(""),
    trackingNumber: text.max(100).default(""),
  }),
  coupons: yup.object({
    code: text.matches(/^[A-Z0-9_-]{2,30}$/).required(),
    percent: yup.number().integer().min(1).max(90).required(),
    maxUses: yup.number().integer().min(1).max(100000).required(),
    active: yup.boolean().required(),
  }),
  reviews: yup.object({ approved: yup.boolean().required() }),
  content: yup.object({
    slug: text.oneOf(["terms-and-conditions", "privacy-policy"]).required(),
    title: text.max(100).required(),
    body: text.max(30000).required(),
    published: yup.boolean().required(),
  }),
  settings: yup.object({
    shipping: yup.number().integer().min(0).max(10000).required(),
    freeShippingThreshold: yup.number().integer().min(0).max(100000).required(),
    supportEmail: text.email().max(160).default(""),
    whatsapp: text
      .matches(/^$|^923\d{9}$/, "Use 923001234567 format.")
      .default(""),
    announcement: text.max(120).required(),
  }),
  staff: yup.object({
    name: text.min(2).max(80).required(),
    email: text.email().max(160).required(),
    password: yup.string().min(8).max(100).required(),
  }),
};
const models = {
  products: "product",
  inventory: "product",
  orders: "order",
  coupons: "coupon",
  reviews: "review",
  content: "content",
  settings: "setting",
  staff: "user",
};
export async function POST(request, { params }) {
  if (!sameOrigin(request))
    return Response.json({ error: "Invalid request." }, { status: 403 });
  const admin = await getAdmin();
  if (!admin)
    return Response.json(
      { error: "Administrator access required." },
      { status: 403 },
    );
  const { module } = await params;
  if (!schemas[module])
    return Response.json({ error: "Unknown module." }, { status: 404 });
  try {
    const body = await request.json();
    const data = await schemas[module].validate(body.data, {
      stripUnknown: true,
      abortEarly: false,
    });
    const id = typeof body.id === "string" ? body.id : null;
    if (!id && !["coupons", "content", "staff"].includes(module))
      return Response.json(
        { error: "Select an existing record." },
        { status: 400 },
      );
    if (module === "staff" && id)
      return Response.json(
        { error: "Existing administrators cannot be changed here." },
        { status: 400 },
      );
    await db.$transaction(async (tx) => {
      if (module === "orders") {
        const previous = await tx.order.findUniqueOrThrow({ where: { id } });
        const transitions = {
          PENDING: ["PENDING", "CONFIRMED", "CANCELLED"],
          CONFIRMED: ["CONFIRMED", "PROCESSING", "CANCELLED"],
          PROCESSING: ["PROCESSING", "SHIPPED", "CANCELLED"],
          SHIPPED: ["SHIPPED", "DELIVERED"],
          DELIVERED: ["DELIVERED"],
          CANCELLED: ["CANCELLED"],
        };
        if (!transitions[previous.status].includes(data.status))
          throw new Error("INVALID_TRANSITION");
        if (
          data.status === "SHIPPED" &&
          (!data.courier || !data.trackingNumber)
        )
          throw new Error("TRACKING_REQUIRED");
        const updated = await tx.order.updateMany({
          where: { id, status: previous.status },
          data,
        });
        if (!updated.count) throw new Error("ORDER_CHANGED");
        if (data.status === "CANCELLED" && previous.status !== "CANCELLED") {
          for (const item of previous.items)
            await tx.product.update({
              where: { id: item.productId },
              data: { stock: { increment: item.quantity } },
            });
          if (previous.couponCode)
            await tx.coupon.updateMany({
              where: { code: previous.couponCode, uses: { gt: 0 } },
              data: { uses: { decrement: 1 } },
            });
        }
      } else if (module === "staff") {
        await tx.user.create({
          data: {
            name: data.name,
            email: data.email.toLowerCase(),
            passwordHash: await hash(data.password, 12),
            role: "ADMIN",
          },
        });
      } else if (id) await tx[models[module]].update({ where: { id }, data });
      else await tx[models[module]].create({ data });
      await tx.auditLog.create({
        data: {
          actorId: admin.id,
          action: `${id ? "UPDATE" : "CREATE"} ${module}`,
          detail: id || data.code || data.slug || data.email,
        },
      });
    });
    return Response.json({ success: true });
  } catch (error) {
    const messages = {
      INVALID_TRANSITION:
        "Choose the next order stage, or cancel before shipment.",
      TRACKING_REQUIRED:
        "Add a courier and tracking number before marking shipped.",
      ORDER_CHANGED: "This order changed. Refresh and try again.",
    };
    if (messages[error.message])
      return Response.json({ error: messages[error.message] }, { status: 409 });
    if (error.code === "P2002")
      return Response.json(
        { error: "A record with these details already exists." },
        { status: 409 },
      );
    return errorResponse(error);
  }
}
