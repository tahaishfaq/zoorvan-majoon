import { notFound, redirect } from "next/navigation";
import Link from "next/link";
import { adminModules, getAdmin, adminData } from "@/lib/admin";
import { databaseConfigured } from "@/lib/db";
import { previewProduct, defaultSettings } from "@/lib/catalog";
import AdminPanel from "@/components/admin/admin-panel";
import { Logout } from "@/components/forms/account-form";
export const metadata = {
  title: "Store administration",
  robots: { index: false, follow: false },
};
export default async function Admin({ params }) {
  const { section = [] } = await params;
  const sectionName = section[0] || "overview";
  if (!adminModules.includes(sectionName) || section.length > 1) notFound();
  const preview = !databaseConfigured;
  let admin = null;
  if (!preview) {
    admin = await getAdmin();
    if (!admin) redirect("/login");
  }
  const data = preview
    ? ["overview", "reports"].includes(sectionName)
      ? {
          orders: 0,
          customers: 0,
          revenue: 0,
          pending: 0,
          delivered: 0,
          products: [previewProduct],
        }
      : ["products", "inventory"].includes(sectionName)
        ? [previewProduct]
        : sectionName === "settings"
          ? [{ id: "store", ...defaultSettings }]
          : []
    : await adminData(sectionName);
  return (
    <div className="container section admin-page">
      <div className="admin-heading">
        <div>
          <p className="eyebrow">ZOORVAN STORE MANAGEMENT</p>
          <h1>{sectionName.charAt(0).toUpperCase() + sectionName.slice(1)}</h1>
        </div>
        <Link href="/" className="text-link">
          View storefront ↗
        </Link>
      </div>
      {preview && (
        <div className="notice">
          Read-only admin preview. Connect PostgreSQL and seed your
          administrator account to manage the store.
        </div>
      )}
      <div className="dashboard-layout">
        <aside className="side-nav">
          {adminModules.map((item) => (
            <Link
              className={sectionName === item ? "active" : ""}
              key={item}
              href={item === "overview" ? "/admin" : `/admin/${item}`}
            >
              {item.charAt(0).toUpperCase() + item.slice(1)}
            </Link>
          ))}
          {admin && <Logout />}
        </aside>
        <div className="dashboard-body">
          <AdminPanel
            module={sectionName}
            data={JSON.parse(JSON.stringify(data))}
            preview={preview}
          />
        </div>
      </div>
    </div>
  );
}
