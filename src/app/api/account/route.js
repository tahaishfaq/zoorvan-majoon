import { auth } from "@/auth";
import { db } from "@/lib/db";
import { sameOrigin, errorResponse } from "@/lib/security";
import { phoneSchema } from "@/lib/validation";
import * as yup from "yup";
import { compare, hash } from "bcryptjs";
export async function PATCH(request) {
  if (!sameOrigin(request))
    return Response.json({ error: "Invalid request." }, { status: 403 });
  const session = await auth();
  if (!session?.user?.id)
    return Response.json({ error: "Sign in first." }, { status: 401 });
  try {
    const body = await request.json();
    if (body.action === "password") {
      const values = await yup
        .object({
          currentPassword: yup.string().max(100).required(),
          password: yup.string().min(10).max(100).required(),
        })
        .validate(body, { stripUnknown: true });
      const user = await db.user.findUnique({ where: { id: session.user.id } });
      if (!(await compare(values.currentPassword, user.passwordHash)))
        return Response.json(
          { error: "Current password is incorrect." },
          { status: 400 },
        );
      await db.user.update({
        where: { id: user.id },
        data: { passwordHash: await hash(values.password, 12) },
      });
    } else {
      const data = await yup
        .object({
          name: yup.string().trim().min(2).max(80).required(),
          phone: phoneSchema,
          address: yup.string().max(400).required(),
          city: yup.string().max(60).required(),
        })
        .validate(body, { stripUnknown: true });
      await db.user.update({ where: { id: session.user.id }, data });
    }
    return Response.json({ success: true });
  } catch (error) {
    return errorResponse(error);
  }
}
