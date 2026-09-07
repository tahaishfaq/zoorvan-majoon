"use client";
import { useState } from "react";
import { Formik, Form } from "formik";
import * as yup from "yup";
import Link from "next/link";
import FormField from "./fields";
export default function RecoveryForm({ token }) {
  const [message, setMessage] = useState("");
  const [error, setError] = useState("");
  const reset = token !== undefined;
  return (
    <>
      <p>
        {reset
          ? "Choose a new password with at least 10 characters."
          : "Enter your account email. We’ll send a secure link if it matches an account."}
      </p>
      {message ? (
        <div role="status" className="notice">
          {message}
          <p>
            <Link href="/login" className="text-link">
              Back to sign in →
            </Link>
          </p>
        </div>
      ) : (
        <Formik
          initialValues={reset ? { password: "" } : { email: "" }}
          validationSchema={
            reset
              ? yup.object({
                  password: yup.string().min(10).max(100).required(),
                })
              : yup.object({ email: yup.string().email().required() })
          }
          onSubmit={async (values, { setSubmitting }) => {
            setError("");
            try {
              const response = await fetch(
                `/api/password/${reset ? "reset" : "forgot"}`,
                {
                  method: "POST",
                  headers: { "Content-Type": "application/json" },
                  body: JSON.stringify({
                    ...values,
                    ...(reset ? { token } : {}),
                  }),
                },
              );
              const data = await response.json();
              if (!response.ok) throw new Error(data.error);
              setMessage(
                reset
                  ? "Your password has been updated. Sign in with your new password."
                  : data.message,
              );
            } catch (err) {
              setError(err.message);
            } finally {
              setSubmitting(false);
            }
          }}
        >
          {({ isSubmitting }) => (
            <Form>
              {reset ? (
                <FormField
                  name="password"
                  label="New password"
                  type="password"
                  autoComplete="new-password"
                />
              ) : (
                <FormField
                  name="email"
                  label="Email address"
                  type="email"
                  autoComplete="email"
                />
              )}
              {error && (
                <p className="error-box" role="alert">
                  {error}
                </p>
              )}
              <button type="submit" className="button" disabled={isSubmitting}>
                {isSubmitting
                  ? "Please wait…"
                  : reset
                    ? "Reset password"
                    : "Send reset link"}
              </button>
            </Form>
          )}
        </Formik>
      )}
      <p className="mt">
        <Link className="text-link" href="/contact">
          Need help? Contact support
        </Link>
      </p>
    </>
  );
}
