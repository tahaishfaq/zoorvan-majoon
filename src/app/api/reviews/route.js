import { auth } from "@/auth";
import { db, databaseConfigured } from "@/lib/db";
import { sameOrigin, rateLimit, errorResponse } from "@/lib/security";
import * as yup from "yup";
export async function POST(request) {
  if (!sameOrigin(request))
    return Response.json({ error: "Invalid request." }, { status: 403 });
  if (!databaseConfigured)
    return Response.json(
      { error: "Reviews are not available during preview." },
      { status: 503 },
    );
  const session = await auth();
  if (!session?.user?.id)
    return Response.json(
      { error: "Sign in to review your purchase." },
      { status: 401 },
    );
  const delivered = await db.order.findFirst({
    where: { userId: session.user.id, status: "DELIVERED" },
    select: { id: true },
  });
  if (!delivered)
    return Response.json(
      { error: "You can review after your order is delivered." },
      { status: 403 },
    );
  if (!rateLimit(`review:${session.user.id}`, 1, 86400000))
    return Response.json(
      { error: "You have already submitted a review today." },
      { status: 429 },
    );
  try {
    const values = await yup
      .object({
        rating: yup.number().integer().min(1).max(5).required(),
        body: yup.string().trim().min(10).max(1000).required(),
      })
      .validate(await request.json(), { stripUnknown: true });
    await db.review.create({
      data: { ...values, name: session.user.name, approved: false },
    });
    return Response.json({ success: true }, { status: 201 });
  } catch (error) {
    return errorResponse(error);
  }
}
