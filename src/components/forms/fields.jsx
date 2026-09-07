"use client";
import { Field, ErrorMessage, useField } from "formik";
export default function FormField({
  name,
  label,
  type = "text",
  as,
  children,
  ...props
}) {
  const [, meta] = useField(name);
  return (
    <div className="field">
      <label htmlFor={name}>{label}</label>
      <Field
        id={name}
        name={name}
        type={type}
        as={as}
        aria-invalid={Boolean(meta.touched && meta.error)}
        aria-describedby={
          meta.touched && meta.error ? `${name}-error` : undefined
        }
        {...props}
      >
        {children}
      </Field>
      <ErrorMessage
        id={`${name}-error`}
        name={name}
        component="span"
        className="field-error"
      />
    </div>
  );
}
