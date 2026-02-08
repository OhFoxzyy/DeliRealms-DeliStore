import { redirect } from "next/navigation";
import { requireAdmin } from "@/lib/auth/management";
import { UsersManagement } from "@/components/management/users-management";

export const metadata = {
  title: 'User Management | DeliRealms',
  description: 'Manage users, roles, and permissions for your platform',
};

export default async function UsersManagementPage() {
  try {
    await requireAdmin();
  } catch (error: any) {
    redirect("/dashboard");
  }

  return <UsersManagement />;
}
