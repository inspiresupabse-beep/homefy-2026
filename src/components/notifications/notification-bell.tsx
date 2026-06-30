"use client";

import { useEffect, useRef, useState } from "react";
import { useRouter, usePathname } from "next/navigation";
import { dispatchOpenLead, OPEN_LEAD_EVENT } from "@/lib/events";
import { Bell } from "lucide-react";
import { cn } from "@/lib/utils";
import { useNotifications } from "@/components/notifications/notification-provider";

export function NotificationBell() {
  const router = useRouter();
  const pathname = usePathname();
  const { reminders, unreadCount, markRead } = useNotifications();
  const [open, setOpen] = useState(false);
  const ref = useRef<HTMLDivElement>(null);

  useEffect(() => {
    function handleClick(e: MouseEvent) {
      if (ref.current && !ref.current.contains(e.target as Node)) {
        setOpen(false);
      }
    }
    document.addEventListener("mousedown", handleClick);
    return () => document.removeEventListener("mousedown", handleClick);
  }, []);

  const sorted = [...reminders].sort(
    (a, b) => new Date(b.remind_at).getTime() - new Date(a.remind_at).getTime()
  );

  async function handleOpenReminder(id: string, leadId: string) {
    await markRead(id);
    setOpen(false);

    if (pathname === "/leads") {
      dispatchOpenLead(leadId);
      return;
    }

    router.push(`/leads?open=${leadId}`);
  }

  return (
    <div ref={ref} className="relative">
      <button
        type="button"
        onClick={() => setOpen((v) => !v)}
        className="relative rounded-lg p-2 text-stone-600 hover:bg-stone-100"
        aria-label="Notifications"
      >
        <Bell className="h-5 w-5" />
        {unreadCount > 0 && (
          <span className="absolute -right-0.5 -top-0.5 flex h-4 min-w-4 items-center justify-center rounded-full bg-red-600 px-1 text-[10px] font-bold text-white">
            {unreadCount > 9 ? "9+" : unreadCount}
          </span>
        )}
      </button>

      {open && (
        <div className="absolute right-0 top-full z-50 mt-2 w-80 max-w-[calc(100vw-2rem)] rounded-xl border border-stone-200 bg-white shadow-xl">
          <div className="border-b border-stone-100 px-4 py-3">
            <h3 className="text-sm font-semibold text-stone-900">Reminders</h3>
            <p className="text-xs text-stone-500">
              {unreadCount > 0 ? `${unreadCount} unread` : "All caught up"}
            </p>
          </div>
          <div className="max-h-80 overflow-y-auto">
            {sorted.length === 0 ? (
              <p className="px-4 py-8 text-center text-sm text-stone-400">No reminders yet</p>
            ) : (
              sorted.map((r) => (
                <button
                  key={r.id}
                  type="button"
                  onClick={() => handleOpenReminder(r.id, r.lead_id)}
                  className={cn(
                    "w-full border-b border-stone-50 px-4 py-3 text-left transition-colors hover:bg-stone-50",
                    !r.read_at && "bg-amber-50/50"
                  )}
                >
                  <div className="flex items-start justify-between gap-2">
                    <p className="text-sm font-medium text-stone-900">{r.title}</p>
                    {!r.read_at && (
                      <span className="mt-1 h-2 w-2 shrink-0 rounded-full bg-red-500" />
                    )}
                  </div>
                  <p className="text-xs text-stone-500">
                    {r.lead?.customer_name ?? "Lead"} ·{" "}
                    {new Date(r.remind_at).toLocaleString("en-IN", {
                      dateStyle: "short",
                      timeStyle: "short",
                    })}
                  </p>
                  {r.message && (
                    <p className="mt-1 line-clamp-2 text-xs text-stone-400">{r.message}</p>
                  )}
                </button>
              ))
            )}
          </div>
        </div>
      )}
    </div>
  );
}
