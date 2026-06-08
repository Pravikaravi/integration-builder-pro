import { cn } from "@/lib/utils";

export function IntegrationConfigLogo({ className }: { className?: string }) {
  return (
    <div
      className={cn(
        "flex h-12 w-12 shrink-0 items-center justify-center rounded-xl bg-primary/15 ring-1 ring-primary/30 shadow-sm",
        className,
      )}
      aria-hidden
    >
      <svg viewBox="0 0 32 32" fill="none" className="h-7 w-7" xmlns="http://www.w3.org/2000/svg">
        <rect x="3" y="10" width="9" height="9" rx="2" fill="oklch(0.72 0.14 75)" />
        <rect x="20" y="4" width="9" height="9" rx="2" fill="oklch(0.78 0.16 75)" />
        <rect x="20" y="19" width="9" height="9" rx="2" fill="oklch(0.78 0.16 75)" />
        <path
          d="M12 14.5h4.5M19.5 8.5L16 12M19.5 23.5L16 20"
          stroke="oklch(0.35 0.06 70)"
          strokeWidth="1.75"
          strokeLinecap="round"
        />
        <circle cx="16.5" cy="16" r="2" fill="oklch(0.55 0.12 75)" />
      </svg>
    </div>
  );
}
