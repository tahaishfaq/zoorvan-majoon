import NextAuth from "next-auth";
import { createHash } from "node:crypto";
import Credentials from "next-auth/providers/credentials";
import { compare } from "bcryptjs";
import { db, databaseConfigured } from "@/lib/db";
import { rateLimit } from "@/lib/security";
export const { handlers, auth, signIn, signOut } = NextAuth({
  pages: { signIn: "/login" },
  session: { strategy: "jwt", maxAge: 60 * 60 * 24 * 7 },
  providers: [
    Credentials({
      credentials: { email: { type: "email" }, password: { type: "password" } },
      async authorize(credentials) {
        if (
          !databaseConfigured ||
          typeof credentials.email !== "string" ||
          typeof credentials.password !== "string" ||
          credentials.password.length > 100
        )
          return null;
        const email = credentials.email.trim().toLowerCase();
        if (!rateLimit(`login:${email}`, 10, 15 * 60 * 1000)) return null;
        const user = await db.user.findUnique({ where: { email } });
        if (!user || !(await compare(credentials.password, user.passwordHash)))
          return null;
        return {
          id: user.id,
          name: user.name,
          email: user.email,
          role: user.role,
          sessionVersion: createHash("sha256")
            .update(user.passwordHash)
            .digest("hex"),
        };
      },
    }),
  ],
  callbacks: {
    async jwt({ token, user }) {
      if (user) {
        token.id = user.id;
        token.role = user.role;
        token.sessionVersion = user.sessionVersion;
      } else {
        if (!databaseConfigured || typeof token.id !== "string") return null;
        const current = await db.user.findUnique({
          where: { id: token.id },
          select: { passwordHash: true, name: true, role: true },
        });
        if (
          !current ||
          createHash("sha256").update(current.passwordHash).digest("hex") !==
            token.sessionVersion
        )
          return null;
        token.name = current.name;
        token.role = current.role;
      }
      return token;
    },
    session({ session, token }) {
      session.user.id = token.id;
      session.user.role = token.role;
      return session;
    },
  },
});
