import { db, databaseConfigured } from "@/lib/db";
import { sameOrigin, rateLimit } from "@/lib/security";
export async function POST(request) {
  if (!sameOrigin(request))
    return Response.json({ error: "Invalid request." }, { status: 403 });
  if (!databaseConfigured)
    return Response.json(
      { error: "Live tracking is not available yet." },
      { status: 503 },
    );
  if (!rateLimit("tracking", 60))
    return Response.json({ error: "Please try again later." }, { status: 429 });
  const { number, phone } = await request.json();
  if (
    typeof number !== "string" ||
    typeof phone !== "string" ||
    number.length > 40 ||
    phone.length > 16
  )
    return Response.json(
      { error: "Enter your order number and phone." },
      { status: 400 },
    );
  const order = await db.order.findFirst({
    where: { number: number.trim().toUpperCase(), phone: phone.trim() },
    select: {
      number: true,
      status: true,
      courier: true,
      trackingNumber: true,
      createdAt: true,
      updatedAt: true,
    },
  });
  if (!order)
    return Response.json(
      {
        error:
          "No matching order found. Check the number and mobile used at checkout.",
      },
      { status: 404 },
    );
  return Response.json({ order });
}
