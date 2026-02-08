import { redirect } from "next/navigation";
import { requireAdmin } from "@/lib/auth/management";
import { ComprehensiveManagementDashboard } from "@/components/management/comprehensive-management-dashboard";

export default async function ManagementPage() {
  try {
    await requireAdmin();
  } catch (error: any) {
    redirect("/dashboard");
  }

  return <ComprehensiveManagementDashboard />;
}
