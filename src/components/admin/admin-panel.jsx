"use client";
import { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { Formik, Form } from "formik";
import Dialog from "./dialog";
import FormField from "@/components/forms/fields";
import { money, statuses } from "@/lib/catalog";
import {
  Plus,
  X,
  MagnifyingGlass,
  ArrowUpRight,
  Package,
} from "@/components/icons";
const fields = {
  products: [
    ["name", "Product name"],
    ["description", "Description", "textarea"],
    ["price", "Price (PKR)", "number"],
    ["weight", "Jar weight"],
    ["active", "Available to order", "checkbox"],
  ],
  inventory: [["stock", "Available stock", "number"]],
  orders: [
    ["status", "Order status", "status"],
    ["courier", "Courier"],
    ["trackingNumber", "Courier tracking number"],
  ],
  coupons: [
    ["code", "Coupon code"],
    ["percent", "Discount (%)", "number"],
    ["maxUses", "Maximum uses", "number"],
    ["active", "Active", "checkbox"],
  ],
  reviews: [["approved", "Publish review", "checkbox"]],
  content: [
    ["slug", "Page", "page"],
    ["title", "Page title"],
    ["body", "Page content", "textarea"],
    ["published", "Published", "checkbox"],
  ],
  settings: [
    ["announcement", "Top announcement"],
    ["shipping", "Delivery charge (PKR)", "number"],
    ["freeShippingThreshold", "Free delivery threshold (PKR)", "number"],
    ["supportEmail", "Support email", "email"],
    ["whatsapp", "WhatsApp (923001234567)"],
  ],
  staff: [
    ["name", "Full name"],
    ["email", "Email address", "email"],
    ["password", "Password (at least 8 characters)", "password"],
  ],
};
const columns = {
  orders: ["number", "name", "city", "total", "status"],
  products: ["name", "price", "weight", "active"],
  inventory: ["name", "stock", "updatedAt"],
  customers: ["name", "email", "phone", "city"],
  coupons: ["code", "percent", "uses", "maxUses", "active"],
  reviews: ["name", "rating", "body", "approved"],
  content: ["title", "slug", "published"],
  settings: ["announcement", "shipping", "freeShippingThreshold"],
  staff: ["name", "email", "role"],
  activity: ["action", "detail", "actorId", "createdAt"],
};
const labels = {
  number: "Order",
  name: "Name",
  city: "City",
  total: "Total",
  status: "Status",
  price: "Price",
  weight: "Weight",
  active: "Active",
  stock: "In stock",
  updatedAt: "Updated",
  email: "Email",
  phone: "Mobile",
  code: "Code",
  percent: "Discount %",
  uses: "Used",
  maxUses: "Limit",
  rating: "Rating",
  body: "Review",
  approved: "Approved",
  title: "Page title",
  slug: "Page",
  published: "Published",
  announcement: "Announcement",
  shipping: "Delivery",
  freeShippingThreshold: "Free delivery from",
  role: "Role",
  action: "Action",
  detail: "Record",
  actorId: "Administrator",
  createdAt: "Date",
};
function value(key, raw) {
  if (raw === null || raw === undefined || raw === "") return "Not set";
  if (typeof raw === "boolean") return raw ? "Yes" : "No";
  if (["price", "total", "shipping", "freeShippingThreshold"].includes(key))
    return money(raw);
  if (key.endsWith("At")) return new Date(raw).toLocaleDateString("en-PK");
  if (key === "status")
    return (
      <span className={`status ${raw.toLowerCase()}`}>{raw.toLowerCase()}</span>
    );
  return String(raw);
}
export default function AdminPanel({ module, data, preview }) {
  const [search, setSearch] = useState("");
  const [editing, setEditing] = useState(null);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");
  const router = useRouter();
  if (["overview", "reports"].includes(module)) {
    const stats = [
      ["Total orders", data.orders],
      ["Delivered revenue", money(data.revenue)],
      ["Awaiting confirmation", data.pending],
      ["Customers", data.customers],
    ];
    return (
      <>
        <div className="metric-grid">
          {stats.map(([label, n]) => (
            <div key={label}>
              <span>{label}</span>
              <strong>{n}</strong>
            </div>
          ))}
        </div>
        <div className="admin-overview-grid">
          <section className="admin-box">
            <h3>Stock overview</h3>
            {data.products.map((p) => (
              <div className="stock-line" key={p.id}>
                <Package size={26} />
                <span>
                  {p.name}
                  <small>{p.weight}</small>
                </span>
                <strong>{p.stock} jars</strong>
              </div>
            ))}
          </section>
          <section className="admin-box">
            <h3>Order performance</h3>
            <p>
              Delivered orders: <strong>{data.delivered}</strong>
            </p>
            <p>
              Delivered revenue includes delivery charges and discounts.
              Cancelled orders are excluded.
            </p>
            <Link className="text-link" href="/admin/orders">
              Manage orders <ArrowUpRight size={16} />
            </Link>
          </section>
        </div>
      </>
    );
  }
  const editable = Boolean(fields[module]);
  const creatable = ["coupons", "content", "staff"].includes(module);
  const rows = data.filter((row) =>
    JSON.stringify(row).toLowerCase().includes(search.toLowerCase()),
  );
  return (
    <>
      <div className="table-toolbar">
        <label className="search-field">
          <MagnifyingGlass size={18} />
          <input
            aria-label={`Search ${module}`}
            placeholder={`Search ${module}…`}
            value={search}
            onChange={(e) => setSearch(e.target.value)}
          />
        </label>
        {creatable && (
          <button
            className="button small"
            disabled={preview}
            onClick={() => {
              setError("");
              setEditing({});
            }}
          >
            <Plus size={16} />
            Add{" "}
            {module === "staff"
              ? "administrator"
              : module === "content"
                ? "page"
                : "coupon"}
          </button>
        )}
      </div>
      {success && (
        <p role="status" className="success-text">
          {success}
        </p>
      )}
      <div className="table-wrap">
        <table>
          <thead>
            <tr>
              {columns[module].map((key) => (
                <th key={key}>{labels[key]}</th>
              ))}
              {editable && <th>Action</th>}
            </tr>
          </thead>
          <tbody>
            {rows.map((row) => (
              <tr key={row.id}>
                {columns[module].map((key) => (
                  <td key={key}>{value(key, row[key])}</td>
                ))}
                {editable && (
                  <td>
                    {module !== "staff" && (
                      <button
                        className="table-edit"
                        disabled={preview}
                        onClick={() => {
                          setError("");
                          setEditing(row);
                        }}
                      >
                        {module === "orders" ? "View / update" : "Edit"}
                      </button>
                    )}
                  </td>
                )}
              </tr>
            ))}
          </tbody>
        </table>
        {rows.length === 0 && (
          <div className="empty">
            <h3>{search ? "No matching records" : `No ${module} yet`}</h3>
            <p>
              {search
                ? "Try a different search."
                : "Records will appear here as your store grows."}
            </p>
          </div>
        )}
      </div>
      <p className="sample-note">
        Showing {rows.length} records. Orders, customers, coupons, reviews and
        activity show the latest 100 records.
      </p>
      {editing && (
        <Dialog onClose={() => setEditing(null)} label={`Edit ${module}`}>
          <div className="dialog-header">
            <h2>
              {editing.id ? "Update" : "Add"} {module}
            </h2>
            <button aria-label="Close editor" onClick={() => setEditing(null)}>
              <X size={24} />
            </button>
          </div>
          {module === "orders" && (
            <div className="notice">
              <strong>
                {editing.number} · {editing.name}
              </strong>
              <p>
                {editing.phone} · {editing.email}
                <br />
                {editing.address}, {editing.city}
              </p>
              <p>
                {editing.items
                  ?.map((item) => `${item.name} × ${item.quantity}`)
                  .join(", ")}
                <br />
                Cash on delivery: {money(editing.total)}
              </p>
              {editing.notes && <p>Notes: {editing.notes}</p>}
            </div>
          )}
          <Formik
            initialValues={Object.fromEntries(
              fields[module].map(([key, , type]) => [
                key,
                editing[key] ??
                  (type === "checkbox"
                    ? false
                    : type === "number"
                      ? 0
                      : key === "slug"
                        ? "terms-and-conditions"
                        : ""),
              ]),
            )}
            onSubmit={async (values, { setSubmitting }) => {
              setError("");
              try {
                const response = await fetch(`/api/admin/${module}`, {
                  method: "POST",
                  headers: { "Content-Type": "application/json" },
                  body: JSON.stringify({ id: editing.id, data: values }),
                });
                const result = await response.json();
                if (!response.ok) throw new Error(result.error);
                setEditing(null);
                setSuccess("Changes saved.");
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
                {fields[module].map(([key, label, type]) =>
                  type === "status" ? (
                    <FormField key={key} name={key} label={label} as="select">
                      {statuses.map((status) => (
                        <option key={status}>{status}</option>
                      ))}
                    </FormField>
                  ) : type === "page" ? (
                    <FormField key={key} name={key} label={label} as="select">
                      <option value="terms-and-conditions">
                        Terms & conditions
                      </option>
                      <option value="privacy-policy">Privacy policy</option>
                    </FormField>
                  ) : (
                    <FormField
                      key={key}
                      name={key}
                      label={label}
                      type={type === "textarea" ? "text" : type || "text"}
                      as={type === "textarea" ? "textarea" : undefined}
                      rows={type === "textarea" ? 6 : undefined}
                    />
                  ),
                )}
                {error && (
                  <p className="error-box" role="alert">
                    {error}
                  </p>
                )}
                <button
                  type="submit"
                  className="button"
                  disabled={isSubmitting}
                >
                  {isSubmitting ? "Saving…" : "Save changes"}
                </button>
              </Form>
            )}
          </Formik>
        </Dialog>
      )}
    </>
  );
}
