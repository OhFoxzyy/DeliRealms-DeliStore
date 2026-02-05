import { redirect } from "next/navigation";
import { requireAdmin } from "@/lib/auth/admin";
import { AdminContentManager } from "@/components/admin/admin-content-manager";

export default async function AdminPage() {
  try {
    await requireAdmin();
  } catch (error: any) {
    redirect("/dashboard");
  }

  return <AdminContentManager />;
}
