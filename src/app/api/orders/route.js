import { randomBytes } from "node:crypto";
import { auth } from "@/auth";
import { db, databaseConfigured } from "@/lib/db";
import { checkoutSchema } from "@/lib/validation";
import { calculateTotals, defaultSettings } from "@/lib/catalog";
import { sameOrigin, rateLimit, errorResponse } from "@/lib/security";
export async function POST(request) {
  if (!sameOrigin(request))
    return Response.json({ error: "Invalid request." }, { status: 403 });
  if (!databaseConfigured || process.env.COMMERCE_ENABLED !== "true")
    return Response.json(
      { error: "Live ordering is not enabled yet." },
      { status: 503 },
    );
  if (!rateLimit("orders", 60))
    return Response.json(
      { error: "Please try again shortly." },
      { status: 429 },
    );
  try {
    const input = await checkoutSchema.validate(await request.json(), {
      stripUnknown: true,
    });
    const session = await auth();
    const order = await db.$transaction(async (tx) => {
      const product = await tx.product.findUnique({
        where: { slug: "zoorvan-majoon" },
      });
      if (!product?.active) throw new Error("PRODUCT_UNAVAILABLE");
      const reserved = await tx.product.updateMany({
        where: { id: product.id, active: true, stock: { gte: input.quantity } },
        data: { stock: { decrement: input.quantity } },
      });
      if (!reserved.count) throw new Error("OUT_OF_STOCK");
      const settings =
        (await tx.setting.findUnique({ where: { id: "store" } })) ||
        defaultSettings;
      let coupon = null;
      if (input.coupon) {
        coupon = await tx.coupon.findUnique({
          where: { code: input.coupon.trim().toUpperCase() },
        });
        if (
          !coupon?.active ||
          coupon.uses >= coupon.maxUses ||
          (coupon.expiresAt && coupon.expiresAt < new Date())
        )
          throw new Error("INVALID_COUPON");
        const used = await tx.coupon.updateMany({
          where: { id: coupon.id, active: true, uses: { lt: coupon.maxUses } },
          data: { uses: { increment: 1 } },
        });
        if (!used.count) throw new Error("INVALID_COUPON");
      }
      const totals = calculateTotals(
        product.price,
        input.quantity,
        settings,
        coupon?.percent || 0,
      );
      if (input.quotedTotal !== undefined && input.quotedTotal !== totals.total)
        throw new Error("PRICE_CHANGED");
      return tx.order.create({
        data: {
          number: `ZM-${randomBytes(6).toString("hex").toUpperCase()}`,
          userId: session?.user?.id || null,
          name: input.name,
          email: input.email.toLowerCase(),
          phone: input.phone,
          address: input.address,
          city: input.city,
          notes: input.notes,
          items: [
            {
              productId: product.id,
              name: product.name,
              price: product.price,
              quantity: input.quantity,
              weight: product.weight,
            },
          ],
          ...totals,
          couponCode: coupon?.code,
        },
      });
    });
    return Response.json(
      {
        order: {
          number: order.number,
          total: order.total,
          status: order.status,
          createdAt: order.createdAt,
        },
      },
      { status: 201 },
    );
  } catch (error) {
    const messages = {
      PRICE_CHANGED:
        "The price or delivery charge changed. Refresh your bag and review the new total.",
      OUT_OF_STOCK: "Not enough jars available. Please reduce your quantity.",
      PRODUCT_UNAVAILABLE: "This product is currently unavailable.",
      INVALID_COUPON: "This coupon is invalid or has expired.",
    };
    if (messages[error.message])
      return Response.json({ error: messages[error.message] }, { status: 409 });
    return errorResponse(error);
  }
}
