import AdminShell from "@/components/admin/admin-shell";
import { getAdmin } from "@/lib/admin";
import { auth } from "@/auth";
import { redirect } from "next/navigation";

export default async function AdminLayout({ children }) {
  const admin = await getAdmin();
  if (!admin) {
    const session = await auth();
    redirect(session?.user?.role === "CUSTOMER" ? "/account" : "/login");
  }
  return <AdminShell name={admin.name}>{children}</AdminShell>;
}
