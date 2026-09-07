"use client";
import Link from "next/link";
import { Formik, Form } from "formik";
import { useState } from "react";
import { useRouter } from "next/navigation";
import { useSession } from "next-auth/react";
import { useCart } from "@/store/cart";
import { useStore } from "@/components/providers";
import { useMounted } from "./header";
import { checkoutSchema } from "@/lib/validation";
import { calculateTotals, money } from "@/lib/catalog";
import FormField from "@/components/forms/fields";
import { Totals } from "./cart-page";
import { Truck, ArrowRight } from "@/components/icons";
export default function CheckoutPage() {
  const { product, settings, preview } = useStore();
  const { quantity, clear } = useCart();
  const mounted = useMounted();
  const router = useRouter();
  const { data: session } = useSession();
  const [error, setError] = useState("");
  const [appliedCoupon, setAppliedCoupon] = useState(null);
  const [applying, setApplying] = useState(false);
  if (!mounted) return <div className="skeleton" style={{ height: 400 }} />;
  if (!quantity)
    return (
      <div className="empty">
        <h2>Your bag is empty</h2>
        <Link className="button" href="/shop">
          Choose your jar
        </Link>
      </div>
    );
  const totals =
    appliedCoupon?.totals || calculateTotals(product.price, quantity, settings);
  return (
    <Formik
      initialValues={{
        name: session?.user?.name || "",
        email: session?.user?.email || "",
        phone: "",
        address: "",
        city: "",
        notes: "",
        quantity,
        coupon: "",
      }}
      validationSchema={checkoutSchema}
      onSubmit={async (values, { setSubmitting }) => {
        setError("");
        try {
          let order;
          if (preview) {
            order = {
              number: `PREVIEW-${Date.now().toString(36).toUpperCase()}`,
              total: totals.total,
              status: "PENDING",
              createdAt: new Date().toISOString(),
              preview: true,
            };
            sessionStorage.setItem(
              "zoorvan-preview-order",
              JSON.stringify({ ...order, phone: values.phone }),
            );
          } else {
            const response = await fetch("/api/orders", {
              method: "POST",
              headers: { "Content-Type": "application/json" },
              body: JSON.stringify({
                ...values,
                quantity,
                coupon: appliedCoupon?.code || "",
                quotedTotal: totals.total,
              }),
            });
            const data = await response.json();
            if (!response.ok) throw new Error(data.error);
            order = data.order;
          }
          sessionStorage.setItem("zoorvan-last-order", JSON.stringify(order));
          clear();
          router.push("/order-success");
        } catch (err) {
          setError(
            err.message || "Unable to place your order. Please try again.",
          );
        } finally {
          setSubmitting(false);
        }
      }}
    >
      {({ isSubmitting, values, setFieldValue }) => (
        <Form className="checkout-grid">
          <div>
            <div className="form-heading">
              <h2>Delivery details</h2>
              {!session && (
                <Link href="/login">Already have an account? Sign in</Link>
              )}
            </div>
            <div className="form-grid">
              <FormField
                name="name"
                label="Full name"
                autoComplete="name"
                placeholder="Your full name"
              />
              <FormField
                name="phone"
                label="Mobile number"
                type="tel"
                autoComplete="tel"
                placeholder="03001234567"
              />
              <FormField
                name="email"
                label="Email address"
                type="email"
                autoComplete="email"
                placeholder="you@example.com"
              />
              <FormField
                name="city"
                label="City"
                autoComplete="address-level2"
                placeholder="e.g. Lahore"
              />
            </div>
            <FormField
              name="address"
              label="Complete delivery address"
              as="textarea"
              autoComplete="street-address"
              placeholder="House / flat, street, area and nearby landmark"
              rows={3}
            />
            <FormField
              name="notes"
              label="Delivery notes (optional)"
              as="textarea"
              placeholder="Anything the courier should know?"
              rows={2}
            />
            <h3 className="mt">Payment method</h3>
            <div className="payment-option">
              <Truck size={26} />
              <div>
                <strong>Cash on delivery</strong>
                <p>Pay the courier when your parcel arrives.</p>
              </div>
              <span className="radio-selected" />
            </div>
            <p className="muted">
              By placing your order, you agree to our{" "}
              <Link href="/terms-and-conditions">terms & conditions</Link> and{" "}
              <Link href="/privacy-policy">privacy policy</Link>.
            </p>
          </div>
          <aside className="summary-panel">
            <h3>Your order</h3>
            <div className="summary-product">
              <span>
                {product.name}
                <small>
                  {product.weight} × {quantity}
                </small>
              </span>
              <strong>{money(product.price * quantity)}</strong>
            </div>
            {!preview && (
              <div className="coupon-field">
                <FormField
                  name="coupon"
                  label="Coupon code (optional)"
                  placeholder="Enter your code"
                  disabled={Boolean(appliedCoupon)}
                />
                <button
                  type="button"
                  className="button outline small"
                  disabled={applying}
                  onClick={async () => {
                    if (appliedCoupon) {
                      setAppliedCoupon(null);
                      setFieldValue("coupon", "");
                      return;
                    }
                    setApplying(true);
                    setError("");
                    try {
                      const response = await fetch("/api/coupons", {
                        method: "POST",
                        headers: { "Content-Type": "application/json" },
                        body: JSON.stringify({ code: values.coupon, quantity }),
                      });
                      const data = await response.json();
                      if (!response.ok) throw new Error(data.error);
                      setAppliedCoupon(data);
                    } catch (err) {
                      setError(err.message);
                    } finally {
                      setApplying(false);
                    }
                  }}
                >
                  {applying
                    ? "Checking…"
                    : appliedCoupon
                      ? "Remove coupon"
                      : "Apply coupon"}
                </button>
              </div>
            )}
            <Totals totals={totals} />
            {appliedCoupon && (
              <p className="success-text" role="status">
                {appliedCoupon.code} applied.
              </p>
            )}
            {preview && (
              <div className="notice">
                Preview checkout. No order will be sent, and no payment is
                collected.
              </div>
            )}
            {error && (
              <p role="alert" className="error-box">
                {error}
              </p>
            )}
            <button
              disabled={isSubmitting || applying}
              className="button full"
              type="submit"
            >
              {isSubmitting
                ? "Placing order…"
                : preview
                  ? "Try preview order"
                  : "Place order · Cash on delivery"}
              <ArrowRight size={17} />
            </button>
          </aside>
        </Form>
      )}
    </Formik>
  );
}
