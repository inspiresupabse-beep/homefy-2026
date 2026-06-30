"use client";

import {
  Bar,
  BarChart,
  CartesianGrid,
  Legend,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from "recharts";
import { Card, CardContent, CardHeader } from "@/components/ui/card";
import { formatCurrency } from "@/lib/utils";
import type { StaffPerformanceRow } from "@/lib/types/database";

export function AdminStaffPerformancePanel({
  rows,
  title = "Staff Performance",
  description = "Track visits, conversions, and sales by team member",
}: {
  rows: StaffPerformanceRow[];
  title?: string;
  description?: string;
}) {
  const chartData = rows.map((row) => ({
    name: row.staffName.split(" ")[0],
    fullName: row.staffName,
    siteVisits: row.siteVisits,
    shopVisits: row.shopVisits,
    conversions: row.conversions,
  }));

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <h2 className="font-semibold text-stone-900">{title}</h2>
          <p className="text-sm text-stone-500">{description}</p>
        </CardHeader>
        <CardContent>
          {rows.length === 0 ? (
            <p className="py-12 text-center text-sm text-stone-400">No staff members yet</p>
          ) : (
            <ResponsiveContainer width="100%" height={320} minHeight={260}>
              <BarChart data={chartData}>
                <CartesianGrid strokeDasharray="3 3" stroke="#e7e5e4" />
                <XAxis dataKey="name" tick={{ fontSize: 12 }} />
                <YAxis allowDecimals={false} tick={{ fontSize: 12 }} />
                <Tooltip labelFormatter={(_, payload) => payload?.[0]?.payload?.fullName ?? ""} />
                <Legend />
                <Bar dataKey="siteVisits" name="Site visits" fill="#b45309" radius={[4, 4, 0, 0]} />
                <Bar dataKey="shopVisits" name="Shop visits" fill="#78716c" radius={[4, 4, 0, 0]} />
                <Bar dataKey="conversions" name="Conversions" fill="#059669" radius={[4, 4, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          )}
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <h2 className="font-semibold text-stone-900">Team overview</h2>
        </CardHeader>
        <CardContent className="overflow-x-auto">
          <table className="w-full min-w-[760px] text-left text-sm">
            <thead>
              <tr className="border-b border-stone-200 text-stone-500">
                <th className="pb-3 pr-4 font-medium">Staff</th>
                <th className="pb-3 pr-4 font-medium">Power</th>
                <th className="pb-3 pr-4 font-medium">Active leads</th>
                <th className="pb-3 pr-4 font-medium">Visits</th>
                <th className="pb-3 pr-4 font-medium">Conversions</th>
                <th className="pb-3 pr-4 font-medium">Orders</th>
                <th className="pb-3 pr-4 font-medium">Sales</th>
                <th className="pb-3 font-medium">Efficiency</th>
              </tr>
            </thead>
            <tbody>
              {rows.map((row) => (
                <tr key={row.staffId} className="border-b border-stone-100">
                  <td className="py-3 pr-4 font-medium text-stone-900">{row.staffName}</td>
                  <td className="py-3 pr-4">
                    <span className="rounded-full bg-amber-50 px-2 py-0.5 text-xs font-medium text-amber-800 ring-1 ring-amber-200">
                      {row.staffPowerLabel}
                    </span>
                  </td>
                  <td className="py-3 pr-4">{row.activeLeads}</td>
                  <td className="py-3 pr-4">{row.totalVisits}</td>
                  <td className="py-3 pr-4 text-emerald-700">{row.conversions}</td>
                  <td className="py-3 pr-4">{row.totalOrders}</td>
                  <td className="py-3 pr-4">{formatCurrency(row.totalSales)}</td>
                  <td className="py-3">
                    {row.totalVisits > 0 ? `${row.efficiency}%` : "—"}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </CardContent>
      </Card>
    </div>
  );
}
