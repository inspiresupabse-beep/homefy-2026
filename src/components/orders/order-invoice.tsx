"use client";

import { formatCurrency } from "@/lib/utils";
import { ORDER_STATUSES, type Order, type ProductLineItem } from "@/lib/types/database";
import { Button } from "@/components/ui/button";
import { Printer } from "lucide-react";

export function OrderInvoice({ order }: { order: Order }) {
  const products = (order.product_details as ProductLineItem[]) ?? [];
  const statusLabel = ORDER_STATUSES.find((s) => s.value === order.status)?.label ?? order.status;
  const issuedAt = new Date().toLocaleDateString("en-IN", {
    day: "numeric",
    month: "long",
    year: "numeric",
  });

  return (
    <div className="space-y-6">
      <div className="flex flex-wrap items-center justify-between gap-3 print:hidden">
        <div>
          <h1 className="text-2xl font-bold text-stone-900">Sales Order / Invoice</h1>
          <p className="text-sm text-stone-500">{order.order_number}</p>
        </div>
        <Button onClick={() => window.print()}>
          <Printer className="mr-2 h-4 w-4" />
          Print Invoice
        </Button>
      </div>

      <div
        id="invoice"
        className="mx-auto max-w-3xl rounded-xl border border-stone-200 bg-white p-6 shadow-sm sm:p-10 print:border-0 print:shadow-none"
      >
        <div className="flex flex-col justify-between gap-6 border-b border-stone-200 pb-6 sm:flex-row">
          <div>
            <h2 className="text-2xl font-bold text-amber-800">Homefy</h2>
            <p className="text-sm text-stone-500">Furniture & Interiors</p>
          </div>
          <div className="text-right text-sm">
            <p className="font-semibold text-stone-900">SALES ORDER</p>
            <p className="text-stone-600">{order.order_number}</p>
            <p className="text-stone-500">Date: {issuedAt}</p>
            <p className="text-stone-500">Status: {statusLabel}</p>
          </div>
        </div>

        <div className="mt-6 grid gap-6 sm:grid-cols-2">
          <div>
            <p className="text-xs font-semibold uppercase tracking-wide text-stone-400">Bill To</p>
            <p className="mt-1 font-medium text-stone-900">{order.customer_name}</p>
            <p className="text-sm text-stone-600">{order.phone}</p>
            {order.address && <p className="text-sm text-stone-600">{order.address}</p>}
          </div>
          {order.delivery_date && (
            <div>
              <p className="text-xs font-semibold uppercase tracking-wide text-stone-400">
                Delivery Date
              </p>
              <p className="mt-1 text-sm text-stone-700">
                {new Date(order.delivery_date).toLocaleDateString("en-IN")}
              </p>
            </div>
          )}
        </div>

        {order.narration && (
          <div className="mt-6 rounded-lg bg-stone-50 p-4 text-sm text-stone-600">
            <p className="text-xs font-semibold uppercase text-stone-400">Visit Notes</p>
            <p className="mt-1 whitespace-pre-wrap">{order.narration}</p>
          </div>
        )}

        <table className="mt-8 w-full text-sm">
          <thead>
            <tr className="border-b border-stone-200 text-left text-stone-500">
              <th className="pb-2 font-medium">Item</th>
              <th className="pb-2 text-right font-medium">Qty</th>
              <th className="pb-2 text-right font-medium">Rate</th>
              <th className="pb-2 text-right font-medium">Amount</th>
            </tr>
          </thead>
          <tbody>
            {products.length === 0 ? (
              <tr>
                <td colSpan={4} className="py-6 text-center text-stone-400">
                  No line items added yet
                </td>
              </tr>
            ) : (
              products.map((p, i) => (
                <tr key={i} className="border-b border-stone-100">
                  <td className="py-3">
                    <p className="font-medium text-stone-800">{p.name}</p>
                    {p.description && (
                      <p className="text-xs text-stone-400">{p.description}</p>
                    )}
                  </td>
                  <td className="py-3 text-right">{p.quantity}</td>
                  <td className="py-3 text-right">{formatCurrency(p.unit_price)}</td>
                  <td className="py-3 text-right font-medium">
                    {formatCurrency(p.quantity * p.unit_price)}
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>

        <div className="mt-6 ml-auto max-w-xs space-y-2 text-sm">
          <div className="flex justify-between">
            <span className="text-stone-500">Subtotal</span>
            <span>{formatCurrency(Number(order.subtotal))}</span>
          </div>
          <div className="flex justify-between">
            <span className="text-stone-500">Discount</span>
            <span className="text-red-600">−{formatCurrency(Number(order.discount))}</span>
          </div>
          <div className="flex justify-between border-t border-stone-200 pt-2 text-base font-bold">
            <span>Total</span>
            <span>{formatCurrency(Number(order.total))}</span>
          </div>
          <div className="flex justify-between">
            <span className="text-stone-500">Advance Paid</span>
            <span className="text-emerald-600">{formatCurrency(Number(order.advance_payment))}</span>
          </div>
          <div className="flex justify-between font-bold text-amber-800">
            <span>Balance Due</span>
            <span>{formatCurrency(Number(order.balance))}</span>
          </div>
        </div>

        <p className="mt-10 text-center text-xs text-stone-400">
          Thank you for choosing Homefy. This is a computer-generated sales order.
        </p>
      </div>
    </div>
  );
}
