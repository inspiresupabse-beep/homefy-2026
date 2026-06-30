"use client";

import { LogOut, X } from "lucide-react";
import { useRouter } from "next/navigation";
import { createClient } from "@/lib/supabase/client";
import { formatRole } from "@/lib/roles";
import { AddToHomeScreen } from "@/components/layout/add-to-home-screen";
import { HomefyLogo } from "@/components/layout/homefy-logo";
import { SidebarNav } from "@/components/layout/sidebar-nav";
import type { Profile } from "@/lib/types/database";

export function Sidebar({
  profile,
  onNavigate,
  onClose,
}: {
  profile: Profile;
  onNavigate?: () => void;
  onClose?: () => void;
}) {
  const router = useRouter();

  async function handleLogout() {
    const supabase = createClient();
    await supabase.auth.signOut();
    router.push("/login");
    router.refresh();
  }

  return (
    <aside className="flex h-full w-full flex-col border-r border-stone-200 bg-stone-950 text-stone-100">
      <div className="flex items-center justify-between border-b border-stone-800 px-4 py-4 sm:px-6 sm:py-5">
        <div className="flex items-center gap-3">
          <HomefyLogo size="md" />
          <div className="min-w-0">
            <p className="font-semibold text-white">Homefy</p>
            <p className="text-xs text-stone-400">Furniture CRM</p>
          </div>
        </div>
        {onClose && (
          <button
            type="button"
            onClick={onClose}
            className="rounded-lg p-2 text-stone-400 hover:bg-stone-900 hover:text-white lg:hidden"
            aria-label="Close menu"
          >
            <X className="h-5 w-5" />
          </button>
        )}
      </div>

      <SidebarNav profile={profile} onNavigate={onNavigate} />

      <div className="border-t border-stone-800 p-4">
        <div className="mb-3 px-2">
          <p className="truncate text-sm font-medium text-white">{profile.full_name}</p>
          <p className="truncate text-xs text-stone-400">{formatRole(profile.role)}</p>
        </div>
        <div className="mb-3">
          <AddToHomeScreen variant="sidebar" />
        </div>
        <button
          type="button"
          onClick={handleLogout}
          className="flex w-full items-center gap-2 rounded-lg px-3 py-2 text-sm text-stone-400 transition-colors hover:bg-stone-900 hover:text-stone-200"
        >
          <LogOut className="h-4 w-4" />
          Sign out
        </button>
      </div>
    </aside>
  );
}
