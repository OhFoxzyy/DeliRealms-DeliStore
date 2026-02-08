import { redirect } from "next/navigation";
import { requireAdmin } from "@/lib/auth/admin";
import { ComprehensiveAdminDashboard } from "@/components/admin/comprehensive-admin-dashboard";

export default async function AdminPage() {
  try {
    await requireAdmin();
  } catch (error: any) {
    redirect("/dashboard");
  }

  return <ComprehensiveAdminDashboard />;
}
