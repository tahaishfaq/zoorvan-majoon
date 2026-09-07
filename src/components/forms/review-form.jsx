"use client";
import { useState } from "react";
import { Formik, Form } from "formik";
import * as yup from "yup";
import FormField from "./fields";
export default function ReviewForm() {
  const [message, setMessage] = useState("");
  const [error, setError] = useState("");
  return (
    <details className="review-form">
      <summary>
        Share your experience <span>+</span>
      </summary>
      {message ? (
        <p role="status" className="success-text">
          {message}
        </p>
      ) : (
        <Formik
          initialValues={{ rating: 5, body: "" }}
          validationSchema={yup.object({
            rating: yup.number().min(1).max(5).required(),
            body: yup.string().min(10).max(1000).required(),
          })}
          onSubmit={async (values, { setSubmitting }) => {
            setError("");
            try {
              const response = await fetch("/api/reviews", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify(values),
              });
              const data = await response.json();
              if (!response.ok) throw new Error(data.error);
              setMessage(
                "Thank you. Your review has been submitted for moderation.",
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
              <FormField name="rating" label="Your rating" as="select">
                {[5, 4, 3, 2, 1].map((n) => (
                  <option key={n} value={n}>
                    {n} out of 5
                  </option>
                ))}
              </FormField>
              <FormField
                name="body"
                label="Your experience"
                as="textarea"
                rows={4}
              />
              {error && (
                <p className="error-box" role="alert">
                  {error}
                </p>
              )}
              <button type="submit" className="button" disabled={isSubmitting}>
                {isSubmitting ? "Submitting…" : "Submit review"}
              </button>
            </Form>
          )}
        </Formik>
      )}
    </details>
  );
}
