import { redirect } from "next/navigation";
import { requireAdmin } from "@/lib/auth/management";
import { TicketDetailManagement } from "@/components/management/ticket-detail-management";

export const metadata = {
  title: 'Ticket Options | DeliRealms',
  description: 'View and manage support ticket details and options',
};

interface PageProps {
  params: Promise<{ id: string }>;
}

export default async function TicketOptionsPage({ params }: PageProps) {
  try {
    await requireAdmin();
  } catch (error: any) {
    redirect("/dashboard");
  }

  const { id } = await params;
  return <TicketDetailManagement ticketId={id} />;
}
