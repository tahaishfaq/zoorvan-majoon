import { auth } from "@/auth";
import { db, databaseConfigured } from "@/lib/db";
import { redirect, notFound } from "next/navigation";
import Link from "next/link";
import ReviewForm from "@/components/forms/review-form";
import AccountForm, { Logout } from "@/components/forms/account-form";
import { money } from "@/lib/catalog";
export const metadata = {
  title: "Your account",
  robots: { index: false, follow: false },
};
export default async function Account({ params }) {
  const { section = [] } = await params;
  const page = section[0] || "overview";
  if (
    !["overview", "profile", "orders", "history", "settings"].includes(page) ||
    section.length > 1
  )
    notFound();
  if (!databaseConfigured)
    return (
      <div className="container section narrow">
        <h1>Your Zoorvan account</h1>
        <p>
          Accounts and order history will be available once the store database
          is connected.
        </p>
        <Link className="button" href="/shop">
          Explore the shop
        </Link>
      </div>
    );
  const session = await auth();
  if (!session?.user?.id) redirect("/login");
  const user = await db.user.findUnique({
    where: { id: session.user.id },
    select: {
      id: true,
      name: true,
      email: true,
      phone: true,
      address: true,
      city: true,
      role: true,
    },
  });
  if (!user) redirect("/login");
  const orders = await db.order.findMany({
    where: { userId: user.id },
    orderBy: { createdAt: "desc" },
    take: 100,
  });
  return (
    <div className="container section">
      <p className="eyebrow">YOUR LITTLE CORNER</p>
      <h1>Assalam-o-Alaikum, {user.name.split(" ")[0]}.</h1>
      <div className="dashboard-layout">
        <aside className="side-nav">
          {[
            ["overview", "Overview"],
            ["profile", "My profile"],
            ["orders", "My orders"],
            ["history", "Order history"],
            ["settings", "Settings"],
          ].map(([slug, label]) => (
            <Link
              className={slug === page ? "active" : ""}
              key={slug}
              href={slug === "overview" ? "/account" : `/account/${slug}`}
            >
              {label}
            </Link>
          ))}
          {user.role === "ADMIN" && (
            <Link href="/admin">Store administration →</Link>
          )}
          <Logout />
        </aside>
        <div className="dashboard-body">
          {page === "profile" ? (
            <>
              <h2>Personal details</h2>
              <p>{user.email}</p>
              <AccountForm user={user} />
            </>
          ) : page === "settings" ? (
            <>
              <h2>Account settings</h2>
              <AccountForm user={user} password />
            </>
          ) : (
            <>
              <h2>
                {page === "overview"
                  ? "Your orders at a glance"
                  : page === "history"
                    ? "Order history"
                    : "My orders"}
              </h2>
              {orders.length === 0 ? (
                <div className="empty">
                  <h3>Your first jar is waiting.</h3>
                  <p>You haven’t placed an order with this account yet.</p>
                  <Link className="button" href="/shop">
                    Shop Majoon
                  </Link>
                </div>
              ) : (
                <div className="orders-list">
                  {orders
                    .filter(
                      (o) =>
                        page !== "history" ||
                        ["DELIVERED", "CANCELLED"].includes(o.status),
                    )
                    .map((order) => (
                      <details key={order.id}>
                        <summary>
                          <span>
                            <strong>{order.number}</strong>
                            <small>
                              {order.createdAt.toLocaleDateString("en-PK")}
                            </small>
                          </span>
                          <span
                            className={`status ${order.status.toLowerCase()}`}
                          >
                            {order.status.toLowerCase()}
                          </span>
                          <strong>{money(order.total)}</strong>
                        </summary>
                        <div className="order-expanded">
                          <p>
                            {order.items
                              .map((i) => `${i.name} × ${i.quantity}`)
                              .join(", ")}
                          </p>
                          <p>
                            Delivery to: {order.address}, {order.city}
                          </p>
                          <p>
                            Cash on delivery ·{" "}
                            {order.courier || "Courier pending"}{" "}
                            {order.trackingNumber || ""}
                          </p>
                          <p>
                            Subtotal {money(order.subtotal)} · Delivery{" "}
                            {money(order.shipping)} · Discount{" "}
                            {money(order.discount)}
                          </p>
                        </div>
                      </details>
                    ))}
                </div>
              )}
            </>
          )}
          {orders.some((order) => order.status === "DELIVERED") && (
            <ReviewForm />
          )}
        </div>
      </div>
    </div>
  );
}
