import { notFound } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import { OrderDetail } from "@/components/orders/order-detail";
import type { Order } from "@/lib/types/database";

export default async function OrderDetailPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const supabase = await createClient();

  const { data: order } = await supabase
    .from("orders")
    .select("*, logistics(*), assigned_agent:profiles!orders_assigned_to_fkey(*), staff_agent:profiles!orders_assigned_staff_fkey(*)")
    .eq("id", id)
    .single();

  if (!order) notFound();

  return <OrderDetail order={order as Order} />;
}
