import { randomBytes, createHash } from "node:crypto";
import nodemailer from "nodemailer";
import { db, databaseConfigured } from "@/lib/db";
import { sameOrigin, rateLimit, errorResponse } from "@/lib/security";
import * as yup from "yup";
export async function POST(request) {
  if (!sameOrigin(request))
    return Response.json({ error: "Invalid request." }, { status: 403 });
  if (
    !databaseConfigured ||
    !process.env.SMTP_URL ||
    !process.env.EMAIL_FROM ||
    !process.env.AUTH_URL
  )
    return Response.json(
      {
        error:
          "Email recovery is not configured yet. Please contact store support.",
      },
      { status: 503 },
    );
  try {
    const { email } = await yup
      .object({ email: yup.string().email().max(160).required() })
      .validate(await request.json(), { stripUnknown: true });
    const normalized = email.trim().toLowerCase();
    if (
      !rateLimit(`reset:${normalized}`, 3, 3600000) ||
      !rateLimit("reset-global", 30, 3600000)
    )
      return Response.json(
        { error: "Please wait before requesting another reset." },
        { status: 429 },
      );
    const user = await db.user.findUnique({
      where: { email: normalized },
      select: { id: true },
    });
    if (user) {
      const token = randomBytes(32).toString("hex");
      const tokenHash = createHash("sha256").update(token).digest("hex");
      await db.passwordReset.deleteMany({ where: { email: normalized } });
      await db.passwordReset.create({
        data: {
          email: normalized,
          tokenHash,
          expiresAt: new Date(Date.now() + 30 * 60000),
        },
      });
      const url = new URL("/reset-password", process.env.AUTH_URL);
      url.searchParams.set("token", token);
      await nodemailer.createTransport(process.env.SMTP_URL).sendMail({
        from: process.env.EMAIL_FROM,
        to: normalized,
        subject: "Reset your Zoorvan password",
        text: `Use this link to reset your password within 30 minutes:\n\n${url}\n\nIf you did not request this, you can ignore this email.`,
      });
    }
    return Response.json({
      success: true,
      message:
        "If an account matches that email, a reset link will arrive shortly.",
    });
  } catch (error) {
    return errorResponse(error);
  }
}
