import { Suspense } from "react";
import LeadsPageClient from "./leads-client";

export default function LeadsPage() {
  return (
    <Suspense fallback={<div className="py-20 text-center text-stone-400">Loading leads...</div>}>
      <LeadsPageClient />
    </Suspense>
  );
}
