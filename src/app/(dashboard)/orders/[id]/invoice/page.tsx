import Link from "next/link";
import { notFound } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import { OrderInvoice } from "@/components/orders/order-invoice";
import { Button } from "@/components/ui/button";
import { ArrowLeft } from "lucide-react";
import type { Order } from "@/lib/types/database";

export default async function OrderInvoicePage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const supabase = await createClient();

  const { data: order } = await supabase
    .from("orders")
    .select("*, staff_agent:profiles!orders_assigned_staff_fkey(full_name)")
    .eq("id", id)
    .single();

  if (!order) notFound();

  return (
    <div className="space-y-4">
      <Link href={`/orders/${id}`}>
        <Button variant="ghost" size="sm">
          <ArrowLeft className="mr-1 h-4 w-4" /> Back to Order
        </Button>
      </Link>
      <OrderInvoice order={order as Order} />
    </div>
  );
}
