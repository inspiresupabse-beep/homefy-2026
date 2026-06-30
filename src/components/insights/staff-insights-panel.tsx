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
import type { StaffConversionInsight } from "@/lib/types/database";

export function StaffInsightsPanel({
  insights,
}: {
  insights: StaffConversionInsight[];
}) {
  const chartData = insights.map((row) => ({
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
          <h2 className="font-semibold text-stone-900">Visits vs Conversions</h2>
          <p className="text-sm text-stone-500">
            Completed site/shop visits compared to leads converted to orders
          </p>
        </CardHeader>
        <CardContent>
          {insights.length === 0 ? (
            <p className="py-12 text-center text-sm text-stone-400">
              No visit or conversion data yet. Assign staff on leads and complete site/shop visits.
            </p>
          ) : (
            <ResponsiveContainer width="100%" height={320} minHeight={260}>
              <BarChart data={chartData}>
                <CartesianGrid strokeDasharray="3 3" stroke="#e7e5e4" />
                <XAxis dataKey="name" tick={{ fontSize: 12 }} />
                <YAxis allowDecimals={false} tick={{ fontSize: 12 }} />
                <Tooltip
                  labelFormatter={(_, payload) =>
                    payload?.[0]?.payload?.fullName ?? ""
                  }
                />
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
          <h2 className="font-semibold text-stone-900">Staff efficiency</h2>
        </CardHeader>
        <CardContent className="overflow-x-auto">
          <table className="w-full min-w-[640px] text-left text-sm">
            <thead>
              <tr className="border-b border-stone-200 text-stone-500">
                <th className="pb-3 pr-4 font-medium">Staff</th>
                <th className="pb-3 pr-4 font-medium">🏠 Site</th>
                <th className="pb-3 pr-4 font-medium">🛒 Shop</th>
                <th className="pb-3 pr-4 font-medium">Total visits</th>
                <th className="pb-3 pr-4 font-medium">Conversions</th>
                <th className="pb-3 font-medium">Efficiency</th>
              </tr>
            </thead>
            <tbody>
              {insights.map((row) => (
                <tr key={row.staffId} className="border-b border-stone-100">
                  <td className="py-3 pr-4 font-medium text-stone-900">{row.staffName}</td>
                  <td className="py-3 pr-4">{row.siteVisits}</td>
                  <td className="py-3 pr-4">{row.shopVisits}</td>
                  <td className="py-3 pr-4">{row.totalVisits}</td>
                  <td className="py-3 pr-4 text-emerald-700">{row.conversions}</td>
                  <td className="py-3">
                    <span
                      className={
                        row.efficiency >= 50
                          ? "font-semibold text-emerald-700"
                          : row.efficiency >= 25
                            ? "font-medium text-amber-700"
                            : "text-stone-600"
                      }
                    >
                      {row.totalVisits > 0 ? `${row.efficiency}%` : "—"}
                    </span>
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
