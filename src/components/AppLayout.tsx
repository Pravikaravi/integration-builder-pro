import { Link, Outlet, useLocation } from "@tanstack/react-router";
import {
  Wifi,
  FileText,
  Building2,
  Trash2,
  Settings,
  Globe,
  Languages,
  Database,
  BookOpen,
  Map,
  LayoutGrid,
  Package,
  Bell,
  Search,
} from "lucide-react";
import { cn } from "@/lib/utils";
import { Toaster } from "@/components/ui/sonner";

const navItems = [
  { label: "Fixed Amenities", icon: Wifi, to: "/amenities" },
  { label: "External Integration Log", icon: FileText, to: "/integration-log" },
  { label: "Facility Upsell", icon: Building2, to: "/facility-upsell" },
  { label: "Waste Setup", icon: Trash2, to: "/waste-setup" },
  { label: "Configurations", icon: Settings, to: "/configurations" },
  { label: "Portal", icon: Globe, to: "/portal" },
  { label: "Translation Import", icon: Languages, to: "/translation-import" },
  { label: "Data Import", icon: Database, to: "/data-import" },
  { label: "Booking Import", icon: BookOpen, to: "/booking-import" },
  { label: "Venue Maps", icon: Map, to: "/venue-maps" },
  { label: "Configuration Layouts", icon: LayoutGrid, to: "/configuration-layouts" },
  { label: "Inventory Management", icon: Package, to: "/inventory" },
];

export function AppLayout({ children }: { children?: React.ReactNode } = {}) {
  const location = useLocation();
  const isConfig = (to: string) =>
    to === "/configurations" && location.pathname.startsWith("/configurations");

  return (
    <div className="flex min-h-screen bg-muted/40">
      {/* Sidebar */}
      <aside className="w-64 shrink-0 border-r border-sidebar-border bg-sidebar sticky top-0 h-screen flex flex-col">
        <div className="h-16 px-6 flex items-center border-b border-sidebar-border">
          <span className="text-xl font-black tracking-tight text-foreground">OPTIMO</span>
        </div>
        <nav className="flex-1 overflow-y-auto px-3 py-4 space-y-0.5">
          {navItems.map((item) => {
            const active = location.pathname === item.to || isConfig(item.to);
            const Icon = item.icon;
            return (
              <Link
                key={item.label}
                to={item.to as never}
                className={cn(
                  "group flex items-center gap-3 rounded-md px-3 py-2 text-sm font-medium transition-all",
                  active
                    ? "bg-accent text-accent-foreground shadow-sm"
                    : "text-sidebar-foreground/80 hover:bg-muted hover:text-sidebar-foreground",
                )}
              >
                <Icon className="h-4 w-4 shrink-0" />
                <span className="truncate">{item.label}</span>
              </Link>
            );
          })}
        </nav>
        <div className="p-4 border-t border-sidebar-border text-xs text-muted-foreground">
          v2.4.1 · Production
        </div>
      </aside>

      {/* Main */}
      <div className="flex-1 flex flex-col min-w-0">
        <header className="h-16 sticky top-0 z-30 bg-card/90 backdrop-blur border-b border-border flex items-center justify-between px-8">
          <div className="relative w-96 max-w-full">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
            <input
              placeholder="Search configurations, integrations, logs…"
              className="w-full h-9 pl-9 pr-3 rounded-md border border-input bg-background text-sm focus:outline-none focus:ring-2 focus:ring-ring/40"
            />
          </div>
          <div className="flex items-center gap-4">
            <button className="relative h-9 w-9 rounded-md hover:bg-muted flex items-center justify-center transition-colors">
              <Bell className="h-4 w-4 text-muted-foreground" />
              <span className="absolute top-2 right-2 h-1.5 w-1.5 rounded-full bg-destructive" />
            </button>
            <div className="flex items-center gap-2.5 pl-4 border-l border-border">
              <div className="h-8 w-8 rounded-full bg-accent text-accent-foreground flex items-center justify-center text-xs font-semibold">
                OU
              </div>
              <div className="text-sm">
                <div className="font-medium text-foreground leading-tight">Optimo User</div>
                <div className="text-xs text-muted-foreground leading-tight">Administrator</div>
              </div>
            </div>
          </div>
        </header>
        <main className="flex-1 p-8">
          <Outlet />
        </main>
      </div>
      <Toaster richColors position="top-right" />
    </div>
  );
}
