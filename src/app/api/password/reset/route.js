import { createHash } from "node:crypto";
import { hash } from "bcryptjs";
import * as yup from "yup";
import { db, databaseConfigured } from "@/lib/db";
import { sameOrigin, rateLimit, errorResponse } from "@/lib/security";
export async function POST(request) {
  if (!sameOrigin(request))
    return Response.json({ error: "Invalid request." }, { status: 403 });
  if (!databaseConfigured)
    return Response.json(
      { error: "Account recovery is not available yet." },
      { status: 503 },
    );
  if (!rateLimit("reset-consume", 60))
    return Response.json(
      { error: "Please try again shortly." },
      { status: 429 },
    );
  try {
    const { token, password } = await yup
      .object({
        token: yup
          .string()
          .matches(/^[a-f0-9]{64}$/)
          .required(),
        password: yup.string().min(8).max(100).required(),
      })
      .validate(await request.json(), { stripUnknown: true });
    const tokenHash = createHash("sha256").update(token).digest("hex");
    const passwordHash = await hash(password, 12);
    await db.$transaction(async (tx) => {
      const reset = await tx.passwordReset.findUnique({ where: { tokenHash } });
      if (!reset || reset.expiresAt < new Date())
        throw new Error("INVALID_RESET");
      const consumed = await tx.passwordReset.deleteMany({
        where: { tokenHash, expiresAt: { gt: new Date() } },
      });
      if (!consumed.count) throw new Error("INVALID_RESET");
      await tx.user.update({
        where: { email: reset.email },
        data: { passwordHash },
      });
    });
    return Response.json({ success: true });
  } catch (error) {
    if (error.message === "INVALID_RESET")
      return Response.json(
        {
          error:
            "This link has expired or has already been used. Request a new one.",
        },
        { status: 400 },
      );
    return errorResponse(error);
  }
}
