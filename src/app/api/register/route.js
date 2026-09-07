import { db, databaseConfigured } from "@/lib/db";
import { registerSchema } from "@/lib/validation";
import { hash } from "bcryptjs";
import { sameOrigin, rateLimit, errorResponse } from "@/lib/security";
export async function POST(request) {
  if (!sameOrigin(request))
    return Response.json({ error: "Invalid request." }, { status: 403 });
  if (!databaseConfigured)
    return Response.json(
      {
        error:
          "Accounts become available when the store database is connected.",
      },
      { status: 503 },
    );
  if (!rateLimit("register", 30, 60000))
    return Response.json({ error: "Please try again later." }, { status: 429 });
  try {
    const input = await registerSchema.validate(await request.json(), {
      stripUnknown: true,
    });
    await db.user.create({
      data: {
        name: input.name,
        email: input.email.toLowerCase().trim(),
        passwordHash: await hash(input.password, 12),
      },
    });
    return Response.json({ success: true }, { status: 201 });
  } catch (error) {
    if (error.code === "P2002")
      return Response.json(
        { error: "Unable to create this account. Try signing in instead." },
        { status: 409 },
      );
    return errorResponse(error);
  }
}
