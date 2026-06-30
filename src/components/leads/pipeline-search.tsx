"use client";

import { Search, X } from "lucide-react";
import { Input } from "@/components/ui/input";

export function PipelineSearch({
  value,
  onChange,
  resultCount,
  totalCount,
}: {
  value: string;
  onChange: (value: string) => void;
  resultCount: number;
  totalCount: number;
}) {
  return (
    <div className="relative">
      <Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-stone-400" />
      <Input
        type="search"
        placeholder="Search by name, phone, narration..."
        value={value}
        onChange={(e) => onChange(e.target.value)}
        className="pl-9 pr-20"
      />
      {value && (
        <button
          type="button"
          onClick={() => onChange("")}
          className="absolute right-14 top-1/2 -translate-y-1/2 text-stone-400 hover:text-stone-600"
        >
          <X className="h-4 w-4" />
        </button>
      )}
      <span className="absolute right-3 top-1/2 -translate-y-1/2 text-xs text-stone-400">
        {resultCount}/{totalCount}
      </span>
    </div>
  );
}
