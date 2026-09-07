"use client";
import { useState, useSyncExternalStore } from "react";
import Link from "next/link";
import { Formik, Form } from "formik";
import * as yup from "yup";
import FormField from "@/components/forms/fields";
import { money, statuses } from "@/lib/catalog";
import {
  Check,
  Package,
  ArrowRight,
  MagnifyingGlass,
} from "@/components/icons";
const subscribe = () => () => {};
const snapshot = () => sessionStorage.getItem("zoorvan-last-order");
export function OrderSuccess() {
  const saved = useSyncExternalStore(subscribe, snapshot, () => null);
  let order = null;
  try {
    order = saved ? JSON.parse(saved) : null;
  } catch {}
  if (!order)
    return (
      <div className="empty">
        <Package size={46} />
        <h1>Your order details</h1>
        <p>Order confirmation appears here after checkout.</p>
        <Link className="button" href="/track-order">
          Track an existing order
        </Link>
      </div>
    );
  return (
    <div className="confirmation">
      <div className="confirmation-icon">
        <Check size={35} />
      </div>
      <p className="eyebrow">
        {order.preview ? "PREVIEW COMPLETE" : "SHUKRIYA!"}
      </p>
      <h1>
        {order.preview ? "That’s how easy it is." : "Thank you for your order."}
      </h1>
      <p>
        {order.preview
          ? "This was a demonstration. No order was sent."
          : "Your order has been received. We’ll prepare it for dispatch."}
      </p>
      <div className="confirmation-details">
        <div>
          <small>Order number</small>
          <strong>{order.number}</strong>
        </div>
        <div>
          <small>Total · Cash on delivery</small>
          <strong>{money(order.total)}</strong>
        </div>
      </div>
      <p>Keep your order number handy to follow your parcel.</p>
      <Link className="button" href="/track-order">
        Track your order <ArrowRight size={18} />
      </Link>
      <Link className="text-link" href="/">
        Back to home
      </Link>
    </div>
  );
}
export function TrackOrder() {
  const [order, setOrder] = useState(null);
  const [error, setError] = useState("");
  return (
    <div className="track-layout">
      <div>
        <p className="eyebrow">FROM OUR DOOR TO YOURS</p>
        <h1>Where’s my order?</h1>
        <p>
          Enter your order number and the mobile number you used at checkout.
        </p>
        <Formik
          initialValues={{ number: "", phone: "" }}
          validationSchema={yup.object({
            number: yup.string().max(40).required("Enter your order number."),
            phone: yup.string().max(16).required("Enter your mobile number."),
          })}
          onSubmit={async (values, { setSubmitting }) => {
            setError("");
            setOrder(null);
            try {
              if (values.number.toUpperCase().startsWith("PREVIEW-")) {
                const preview = JSON.parse(
                  sessionStorage.getItem("zoorvan-preview-order") || "null",
                );
                if (
                  !preview ||
                  preview.number !== values.number.toUpperCase().trim() ||
                  preview.phone !== values.phone.trim()
                )
                  throw new Error(
                    "No matching preview order found on this device.",
                  );
                setOrder(preview);
              } else {
                const response = await fetch("/api/track", {
                  method: "POST",
                  headers: { "Content-Type": "application/json" },
                  body: JSON.stringify(values),
                });
                const data = await response.json();
                if (!response.ok) throw new Error(data.error);
                setOrder(data.order);
              }
            } catch (err) {
              setError(err.message);
            } finally {
              setSubmitting(false);
            }
          }}
        >
          {({ isSubmitting }) => (
            <Form>
              <FormField
                name="number"
                label="Order number"
                placeholder="e.g. ZM-A1B2C3D4E5F6"
              />
              <FormField
                name="phone"
                label="Mobile number"
                type="tel"
                placeholder="03001234567"
              />
              {error && (
                <div role="alert" className="error-box">
                  {error}
                </div>
              )}
              <button type="submit" className="button" disabled={isSubmitting}>
                {isSubmitting ? "Finding your order…" : "Track order"}
                <MagnifyingGlass size={18} />
              </button>
            </Form>
          )}
        </Formik>
      </div>
      <div className="tracking-panel">
        {order ? (
          <>
            <Package size={35} />
            <h2>{order.number}</h2>
            {order.preview && (
              <p className="notice">
                Preview only. This parcel will not be dispatched.
              </p>
            )}
            {order.status === "CANCELLED" ? (
              <p className="error-box">This order was cancelled.</p>
            ) : (
              <ol className="timeline">
                {statuses
                  .filter((s) => s !== "CANCELLED")
                  .map((status, index) => (
                    <li
                      className={
                        index <= statuses.indexOf(order.status)
                          ? "complete"
                          : ""
                      }
                      key={status}
                    >
                      <span>
                        {index <= statuses.indexOf(order.status) ? (
                          <Check size={13} />
                        ) : (
                          index + 1
                        )}
                      </span>
                      {status
                        .toLowerCase()
                        .replace(/^./, (c) => c.toUpperCase())}
                    </li>
                  ))}
              </ol>
            )}
            {order.courier && (
              <p>
                Courier: {order.courier}
                <br />
                Tracking number: {order.trackingNumber || "Awaiting dispatch"}
              </p>
            )}
          </>
        ) : (
          <>
            <Package size={55} weight="thin" />
            <h2>A little care, on its way.</h2>
            <p>Your order’s progress will appear here.</p>
          </>
        )}
      </div>
    </div>
  );
}
