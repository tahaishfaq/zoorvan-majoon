import { notFound, redirect } from "next/navigation";
import { adminModules, getAdmin, adminData } from "@/lib/admin";
import { auth } from "@/auth";
import AdminPanel from "@/components/admin/admin-panel";
export const metadata = {
  title: "Store administration",
  robots: { index: false, follow: false },
};
export default async function Admin({ params }) {
  const { section = [] } = await params;
  const sectionName = section[0] || "overview";
  if (!adminModules.includes(sectionName) || section.length > 1) notFound();
  // Check each page request as well as the persistent layout.
  if (!(await getAdmin())) {
    const session = await auth();
    redirect(session?.user?.role === "CUSTOMER" ? "/account" : "/login");
  }
  const data = await adminData(sectionName);
  return (
    <div className="admin-page">
      <div className="admin-heading">
        <div>
          <h1>{sectionName.charAt(0).toUpperCase() + sectionName.slice(1)}</h1>
        </div>
      </div>
      <div className="dashboard-body">
        <AdminPanel
          module={sectionName}
          data={JSON.parse(JSON.stringify(data))}
          preview={false}
        />
      </div>
    </div>
  );
}
