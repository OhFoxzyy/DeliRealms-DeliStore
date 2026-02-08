import { redirect } from "next/navigation";
import { requireAdmin } from "@/lib/auth/management";
import { AbuseManagement } from "@/components/management/abuse-management";

export const metadata = {
  title: 'Abuse Detection | DeliRealms',
  description: 'Monitor and manage abuse detection, IP tracking, and security alerts',
};

export default async function AbuseManagementPage() {
  try {
    await requireAdmin();
  } catch (error: any) {
    redirect("/dashboard");
  }

  return <AbuseManagement />;
}
