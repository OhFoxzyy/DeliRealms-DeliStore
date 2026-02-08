import { redirect } from "next/navigation";
import { requireAdmin } from "@/lib/auth/management";
import { RoleDetailManagement } from "@/components/management/role-detail-management";

export const metadata = {
  title: 'Manage Role | DeliRealms',
  description: 'Configure role permissions and access controls',
};

interface PageProps {
  params: Promise<{ id: string }>;
}

export default async function RoleManagePage({ params }: PageProps) {
  try {
    await requireAdmin();
  } catch (error: any) {
    redirect("/dashboard");
  }

  const { id } = await params;
  return <RoleDetailManagement roleId={id} />;
}
