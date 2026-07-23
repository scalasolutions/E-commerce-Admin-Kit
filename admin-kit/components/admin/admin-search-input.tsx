import { Search } from "lucide-react";
import { Input } from "@/components/ui/input";
import { cn } from "@/lib/utils";

interface AdminSearchInputProps {
  value: string;
  onChange: (value: string) => void;
  placeholder?: string;
  /** Extra classes for the wrapper — override the default width here if needed. */
  className?: string;
}

/**
 * The standard admin list-page search box: a leading icon plus an input at one
 * consistent, generous width. Shared across the listing pages so every search
 * bar looks and behaves identically.
 */
export default function AdminSearchInput({
  value,
  onChange,
  placeholder = "Search…",
  className,
}: AdminSearchInputProps) {
  return (
    <div className={cn("relative w-full sm:w-96", className)}>
      <span className="pointer-events-none absolute inset-y-0 left-3.5 flex items-center text-admin-text-disabled">
        <Search className="h-4 w-4" />
      </span>
      <Input
        type="text"
        placeholder={placeholder}
        className="h-10 w-full pl-10 text-xs"
        value={value}
        onChange={(e) => onChange(e.target.value)}
      />
    </div>
  );
}
