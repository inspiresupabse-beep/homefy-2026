import { createClient } from "@/lib/supabase/server";
import { requireAdmin } from "@/lib/auth/require-admin";
import { PageHeader } from "@/components/layout/page-header";
import { CreateUserForm } from "@/components/users/create-user-form";
import { UsersList } from "@/components/users/users-list";
import type { Profile } from "@/lib/types/database";

export default async function UsersPage() {
  const currentProfile = await requireAdmin();
  const supabase = await createClient();

  const { data: users } = await supabase
    .from("profiles")
    .select("*")
    .order("created_at", { ascending: false });

  return (
    <div className="space-y-6 sm:space-y-8">
      <PageHeader
        title="User Management"
        description="Add, edit, and delete team accounts"
      />

      <div className="grid grid-cols-1 gap-6 lg:grid-cols-2 lg:gap-8">
        <CreateUserForm />
        <UsersList
          users={(users as Profile[]) ?? []}
          currentUserId={currentProfile.id}
        />
      </div>
    </div>
  );
}
