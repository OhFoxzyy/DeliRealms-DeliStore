import { redirect } from "next/navigation";
import { requireAdmin } from "@/lib/auth/management";
import { UserDetailManagement } from "@/components/management/user-detail-management";

export const metadata = {
  title: 'Manage User | DeliRealms',
  description: 'View and manage individual user details, permissions, and activity',
};

interface PageProps {
  params: Promise<{ id: string }>;
}

export default async function UserManagePage({ params }: PageProps) {
  try {
    await requireAdmin();
  } catch (error: any) {
    redirect("/dashboard");
  }

  const { id } = await params;
  return <UserDetailManagement userId={id} />;
}
