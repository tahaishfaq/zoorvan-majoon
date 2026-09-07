import { db, databaseConfigured } from "@/lib/db";
import { defaultSettings, calculateTotals } from "@/lib/catalog";
import { sameOrigin, rateLimit, errorResponse } from "@/lib/security";
import * as yup from "yup";
export async function POST(request) {
  if (!sameOrigin(request))
    return Response.json({ error: "Invalid request." }, { status: 403 });
  if (!databaseConfigured || process.env.COMMERCE_ENABLED !== "true")
    return Response.json(
      { error: "Coupons are not available during preview." },
      { status: 503 },
    );
  if (!rateLimit("coupons", 60))
    return Response.json(
      { error: "Please try again shortly." },
      { status: 429 },
    );
  try {
    const { code, quantity } = await yup
      .object({
        code: yup.string().trim().max(30).required(),
        quantity: yup.number().integer().min(1).max(20).required(),
      })
      .validate(await request.json(), { stripUnknown: true });
    const [coupon, product, settings] = await Promise.all([
      db.coupon.findUnique({ where: { code: code.toUpperCase() } }),
      db.product.findUnique({ where: { slug: "zoorvan-majoon" } }),
      db.setting.findUnique({ where: { id: "store" } }),
    ]);
    if (
      !coupon?.active ||
      coupon.uses >= coupon.maxUses ||
      (coupon.expiresAt && coupon.expiresAt < new Date())
    )
      return Response.json(
        { error: "This coupon is invalid or has expired." },
        { status: 400 },
      );
    if (!product?.active)
      return Response.json(
        { error: "Product is unavailable." },
        { status: 409 },
      );
    return Response.json({
      code: coupon.code,
      totals: calculateTotals(
        product.price,
        quantity,
        settings || defaultSettings,
        coupon.percent,
      ),
    });
  } catch (error) {
    return errorResponse(error);
  }
}
