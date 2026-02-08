import { redirect } from "next/navigation";
import { requireAdmin } from "@/lib/auth/management";
import { TicketsManagement } from "@/components/management/tickets-management";

export const metadata = {
  title: 'Support Tickets | DeliRealms',
  description: 'Manage support tickets, user inquiries, and customer service',
};

export default async function TicketsManagementPage() {
  try {
    await requireAdmin();
  } catch (error: any) {
    redirect("/dashboard");
  }

  return <TicketsManagement />;
}
