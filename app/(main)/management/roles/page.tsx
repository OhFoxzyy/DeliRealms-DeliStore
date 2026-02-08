import { redirect } from "next/navigation";
import { requireAdmin } from "@/lib/auth/management";
import { RolesManagement } from "@/components/management/roles-management";

export const metadata = {
  title: 'Role Management | DeliRealms',
  description: 'Create and manage roles, configure permissions, and set access controls',
};

export default async function RolesManagementPage() {
  try {
    await requireAdmin();
  } catch (error: any) {
    redirect("/dashboard");
  }

  return <RolesManagement />;
}
