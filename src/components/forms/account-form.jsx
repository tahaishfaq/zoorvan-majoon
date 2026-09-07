"use client";
import { Formik, Form } from "formik";
import * as yup from "yup";
import { useState } from "react";
import { signOut } from "next-auth/react";
import FormField from "./fields";
import { phoneSchema } from "@/lib/validation";
export function Logout() {
  return (
    <button className="text-link" onClick={() => signOut({ callbackUrl: "/" })}>
      Sign out
    </button>
  );
}
export default function AccountForm({ user, password = false }) {
  const [message, setMessage] = useState("");
  const [error, setError] = useState("");
  return (
    <Formik
      initialValues={
        password
          ? { currentPassword: "", password: "" }
          : {
              name: user.name,
              phone: user.phone || "",
              address: user.address || "",
              city: user.city || "",
            }
      }
      validationSchema={
        password
          ? yup.object({
              currentPassword: yup.string().required(),
              password: yup.string().min(8).max(100).required(),
            })
          : yup.object({
              name: yup.string().min(2).required(),
              phone: phoneSchema,
              address: yup.string().max(400).required(),
              city: yup.string().max(60).required(),
            })
      }
      onSubmit={async (values, { setSubmitting, resetForm }) => {
        setError("");
        setMessage("");
        try {
          const response = await fetch("/api/account", {
            method: "PATCH",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({
              ...values,
              action: password ? "password" : "profile",
            }),
          });
          const data = await response.json();
          if (!response.ok) throw new Error(data.error);
          setMessage(
            password ? "Password updated." : "Your details have been saved.",
          );
          if (password) resetForm();
        } catch (err) {
          setError(err.message);
        } finally {
          setSubmitting(false);
        }
      }}
    >
      {({ isSubmitting }) => (
        <Form className="account-form">
          {password ? (
            <>
              <FormField
                name="currentPassword"
                label="Current password"
                type="password"
                autoComplete="current-password"
              />
              <FormField
                name="password"
                label="New password"
                type="password"
                autoComplete="new-password"
              />
            </>
          ) : (
            <>
              <FormField name="name" label="Full name" />
              <FormField name="phone" label="Mobile number" type="tel" />
              <FormField
                name="address"
                label="Delivery address"
                as="textarea"
              />
              <FormField name="city" label="City" />
            </>
          )}
          {message && (
            <p className="success-text" role="status">
              {message}
            </p>
          )}
          {error && (
            <p className="error-box" role="alert">
              {error}
            </p>
          )}
          <button type="submit" className="button" disabled={isSubmitting}>
            {isSubmitting
              ? "Saving…"
              : password
                ? "Update password"
                : "Save details"}
          </button>
        </Form>
      )}
    </Formik>
  );
}
