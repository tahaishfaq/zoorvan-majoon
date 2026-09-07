"use client";
import { useState } from "react";
import { Formik, Form } from "formik";
import * as yup from "yup";
import { getSession, signIn } from "next-auth/react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import FormField from "./fields";
import { registerSchema } from "@/lib/validation";
import { ArrowRight, Leaf } from "@/components/icons";
export default function AuthForm({ register = false }) {
  const [error, setError] = useState("");
  const router = useRouter();
  return (
    <div className="auth-layout">
      <div className="auth-aside">
        <Leaf size={54} weight="light" />
        <h2>
          Apni riwayat.
          <br />
          Apna khayal.
        </h2>
        <p>
          A familiar tradition.
          <br />A simpler way to shop.
        </p>
        <span lang="ur">زوروان، آپ کے لیے</span>
      </div>
      <div className="auth-form">
        <p className="eyebrow">YOUR ZOORVAN ACCOUNT</p>
        <h1>{register ? "Make yourself at home." : "Welcome back."}</h1>
        <p>
          {register
            ? "Keep your details and orders in one place."
            : "Sign in to see your orders and account."}
        </p>
        <Formik
          initialValues={{ name: "", email: "", password: "" }}
          validationSchema={
            register
              ? registerSchema
              : yup.object({
                  email: yup.string().email().required(),
                  password: yup.string().required(),
                })
          }
          onSubmit={async (values, { setSubmitting }) => {
            setError("");
            try {
              if (register) {
                const response = await fetch("/api/register", {
                  method: "POST",
                  headers: { "Content-Type": "application/json" },
                  body: JSON.stringify(values),
                });
                const data = await response.json();
                if (!response.ok) throw new Error(data.error);
              }
              const result = await signIn("credentials", {
                email: values.email,
                password: values.password,
                redirect: false,
              });
              if (result?.error)
                throw new Error(
                  "Unable to sign in. Check your details, or try again later.",
                );
              const session = await getSession();
              router.push(session?.user?.role === "ADMIN" ? "/admin" : "/account");
              router.refresh();
            } catch (err) {
              setError(err.message);
            } finally {
              setSubmitting(false);
            }
          }}
        >
          {({ isSubmitting }) => (
            <Form>
              {register && (
                <FormField name="name" label="Full name" autoComplete="name" />
              )}
              <FormField
                name="email"
                label="Email address"
                type="email"
                autoComplete="email"
              />
              <FormField
                name="password"
                label="Password"
                type="password"
                autoComplete={register ? "new-password" : "current-password"}
              />
              {!register && (
                <Link href="/forgot-password" className="forgot">
                  Forgot password?
                </Link>
              )}
              {error && (
                <p className="error-box" role="alert">
                  {error}
                </p>
              )}
              <button
                type="submit"
                className="button full"
                disabled={isSubmitting}
              >
                {isSubmitting
                  ? "Please wait…"
                  : register
                    ? "Create account"
                    : "Sign in"}
                <ArrowRight size={18} />
              </button>
            </Form>
          )}
        </Formik>
        <p className="auth-switch">
          {register ? "Already have an account?" : "New to Zoorvan?"}{" "}
          <Link href={register ? "/login" : "/register"}>
            {register ? "Sign in" : "Create an account"}
          </Link>
        </p>
      </div>
    </div>
  );
}
