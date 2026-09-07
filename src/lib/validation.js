import * as yup from "yup";
export const phoneSchema = yup
  .string()
  .matches(
    /^(\+92|0092|0)3\d{9}$/,
    "Enter a Pakistani mobile number, e.g. 03001234567.",
  )
  .required("Mobile number is required.");
export const checkoutSchema = yup.object({
  name: yup.string().trim().min(2).max(80).required("Full name is required."),
  email: yup.string().email().max(160).required("Email is required."),
  phone: phoneSchema,
  address: yup
    .string()
    .trim()
    .min(10, "Please include house, street and area.")
    .max(400)
    .required(),
  city: yup.string().trim().min(2).max(60).required(),
  notes: yup.string().max(500),
  quantity: yup.number().integer().min(1).max(20).required(),
  coupon: yup.string().max(30),
  quotedTotal: yup.number().integer().min(0).optional(),
});
export const registerSchema = yup.object({
  name: yup.string().trim().min(2).max(80).required(),
  email: yup.string().email().max(160).required(),
  password: yup
    .string()
    .min(8, "Use at least 8 characters.")
    .max(100)
    .required(),
});
