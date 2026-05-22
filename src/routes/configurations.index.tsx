import { createFileRoute, Link } from "@tanstack/react-router";
import { useMemo, useState } from "react";
import {
  Plus,
  Search,
  Filter,
  ChevronDown,
  ChevronRight,
  ChevronLeft,
  Eye,
  Pencil,
  Trash2,
  MoreHorizontal,
  Download,
  ArrowUpDown,
  CheckCircle2,
  PauseCircle,
  AlertCircle,
  Home,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import { AddIntegrationModal } from "@/components/integrations/AddIntegrationModal";
import { AppLayout } from "@/components/AppLayout";

export const Route = createFileRoute("/configurations/")({
  component: () => (
    <AppLayout>
      <ConfigurationsListPage />
    </AppLayout>
  ),
});

type Status = "Active" | "Inactive" | "Error";

interface Row {
  id: string;
  name: string;
  type: "Push" | "Pull" | "File" | "Document";
  category: string;
  status: Status;
  updated: string;
  contact: string;
}

const ROWS: Row[] = [
  { id: "INT-1042", name: "Salesforce CRM Sync", type: "Push", category: "CRM", status: "Active", updated: "2 hours ago", contact: "admin@mail.com" },
  { id: "INT-1041", name: "Marriott PMS Inbound", type: "Pull", category: "PMS", status: "Active", updated: "5 hours ago", contact: "test1@mail.com" },
  { id: "INT-1039", name: "Nightly Revenue Export", type: "File", category: "Finance", status: "Active", updated: "Yesterday", contact: "test2@mail.com" },
  { id: "INT-1037", name: "Guest Document Upload", type: "Document", category: "Compliance", status: "Inactive", updated: "3 days ago", contact: "admin@mail.com" },
  { id: "INT-1035", name: "Stripe Payments Webhook", type: "Push", category: "Payments", status: "Active", updated: "4 days ago", contact: "test1@mail.com" },
  { id: "INT-1031", name: "HubSpot Lead Pull", type: "Pull", category: "Marketing", status: "Error", updated: "6 days ago", contact: "test2@mail.com" },
  { id: "INT-1028", name: "QuickBooks Invoice Sync", type: "Push", category: "Finance", status: "Active", updated: "1 week ago", contact: "admin@mail.com" },
  { id: "INT-1024", name: "Zendesk Ticket Mirror", type: "Pull", category: "Support", status: "Inactive", updated: "2 weeks ago", contact: "test1@mail.com" },
  { id: "INT-1019", name: "Daily Audit File Drop", type: "File", category: "Finance", status: "Active", updated: "2 weeks ago", contact: "test2@mail.com" },
];

const StatusBadge = ({ status }: { status: Status }) => {
  const map = {
    Active: { cls: "bg-success/10 text-success border-success/20", Icon: CheckCircle2 },
    Inactive: { cls: "bg-muted text-muted-foreground border-border", Icon: PauseCircle },
    Error: { cls: "bg-destructive/10 text-destructive border-destructive/20", Icon: AlertCircle },
  } as const;
  const { cls, Icon } = map[status];
  return (
    <span className={cn("inline-flex items-center gap-1.5 px-2 py-0.5 rounded-full text-xs font-medium border", cls)}>
      <Icon className="h-3 w-3" />
      {status}
    </span>
  );
};

const TypePill = ({ type }: { type: Row["type"] }) => {
  const cls = {
    Push: "bg-accent text-accent-foreground",
    Pull: "bg-info/10 text-info",
    File: "bg-primary/15 text-primary-foreground/90",
    Document: "bg-muted text-foreground",
  }[type];
  return <span className={cn("inline-flex px-2 py-0.5 rounded text-xs font-medium", cls)}>{type}</span>;
};

function ConfigurationsListPage() {
  const [query, setQuery] = useState("");
  const [statusFilter, setStatusFilter] = useState<Status | "All">("All");
  const [typeFilter, setTypeFilter] = useState<Row["type"] | "All">("All");
  const [showFilter, setShowFilter] = useState(false);
  const [showStatus, setShowStatus] = useState(false);
  const [modalOpen, setModalOpen] = useState(false);
  const [page, setPage] = useState(1);
  const pageSize = 8;

  const filtered = useMemo(() => {
    return ROWS.filter(
      (r) =>
        (statusFilter === "All" || r.status === statusFilter) &&
        (typeFilter === "All" || r.type === typeFilter) &&
        (query === "" || r.name.toLowerCase().includes(query.toLowerCase()) || r.id.includes(query)),
    );
  }, [query, statusFilter, typeFilter]);

  const total = filtered.length;
  const pageCount = Math.max(1, Math.ceil(total / pageSize));
  const visible = filtered.slice((page - 1) * pageSize, page * pageSize);

  const stats = [
    { label: "Total Integrations", value: ROWS.length, change: "+2 this week" },
    { label: "Active", value: ROWS.filter((r) => r.status === "Active").length, change: "98.4% uptime" },
    { label: "Inactive", value: ROWS.filter((r) => r.status === "Inactive").length, change: "—" },
    { label: "In Error", value: ROWS.filter((r) => r.status === "Error").length, change: "Needs attention" },
  ];

  return (
    <div className="space-y-6 max-w-[1400px] mx-auto">
      {/* Breadcrumb */}
      <nav className="flex items-center gap-1.5 text-sm text-muted-foreground">
        <Home className="h-3.5 w-3.5" />
        <span>Configurations</span>
        <ChevronRight className="h-3.5 w-3.5" />
        <span className="text-foreground font-medium">Integration Configuration</span>
      </nav>

      {/* Title */}
      <div className="flex items-end justify-between gap-4 flex-wrap">
        <div>
          <h1 className="text-2xl font-bold tracking-tight text-foreground">Integration Configuration</h1>
          <p className="text-sm text-muted-foreground mt-1">
            Manage push, pull, file, and document integrations connecting Optimo to external systems.
          </p>
        </div>
        <div className="flex items-center gap-2">
          <Button variant="outline" size="sm">
            <Download className="h-4 w-4" />
            Export
          </Button>
          <Button size="sm" onClick={() => setModalOpen(true)} className="shadow-sm">
            <Plus className="h-4 w-4" />
            Add Integration
          </Button>
        </div>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        {stats.map((s) => (
          <div key={s.label} className="rounded-xl border border-border bg-card p-5 shadow-[var(--shadow-soft)]">
            <div className="text-xs uppercase tracking-wide text-muted-foreground font-medium">{s.label}</div>
            <div className="mt-2 flex items-baseline gap-2">
              <span className="text-3xl font-bold text-foreground">{s.value}</span>
            </div>
            <div className="mt-1 text-xs text-muted-foreground">{s.change}</div>
          </div>
        ))}
      </div>

      {/* Filters bar */}
      <div className="rounded-xl border border-border bg-card shadow-[var(--shadow-soft)]">
        <div className="p-4 flex items-center gap-3 flex-wrap border-b border-border">
          <div className="relative flex-1 min-w-[240px]">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
            <input
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              placeholder="Search by name or ID…"
              className="w-full h-9 pl-9 pr-3 rounded-md border border-input bg-background text-sm focus:outline-none focus:ring-2 focus:ring-ring/40"
            />
          </div>

          {/* Type filter */}
          <div className="relative">
            <button
              onClick={() => {
                setShowFilter((v) => !v);
                setShowStatus(false);
              }}
              className="inline-flex items-center gap-2 h-9 px-3 rounded-md border border-input bg-background text-sm hover:bg-muted transition-colors"
            >
              <Filter className="h-3.5 w-3.5" />
              Type: <span className="font-medium">{typeFilter}</span>
              <ChevronDown className={cn("h-3.5 w-3.5 transition-transform", showFilter && "rotate-180")} />
            </button>
            {showFilter && (
              <div className="absolute right-0 mt-2 w-44 rounded-md border border-border bg-popover shadow-lg z-20 py-1 animate-in fade-in-0 zoom-in-95">
                {(["All", "Push", "Pull", "File", "Document"] as const).map((opt) => (
                  <button
                    key={opt}
                    onClick={() => {
                      setTypeFilter(opt);
                      setShowFilter(false);
                    }}
                    className={cn(
                      "w-full text-left px-3 py-1.5 text-sm hover:bg-muted",
                      typeFilter === opt && "bg-accent text-accent-foreground font-medium",
                    )}
                  >
                    {opt}
                  </button>
                ))}
              </div>
            )}
          </div>

          {/* Status filter */}
          <div className="relative">
            <button
              onClick={() => {
                setShowStatus((v) => !v);
                setShowFilter(false);
              }}
              className="inline-flex items-center gap-2 h-9 px-3 rounded-md border border-input bg-background text-sm hover:bg-muted transition-colors"
            >
              Status: <span className="font-medium">{statusFilter}</span>
              <ChevronDown className={cn("h-3.5 w-3.5 transition-transform", showStatus && "rotate-180")} />
            </button>
            {showStatus && (
              <div className="absolute right-0 mt-2 w-44 rounded-md border border-border bg-popover shadow-lg z-20 py-1 animate-in fade-in-0 zoom-in-95">
                {(["All", "Active", "Inactive", "Error"] as const).map((opt) => (
                  <button
                    key={opt}
                    onClick={() => {
                      setStatusFilter(opt);
                      setShowStatus(false);
                    }}
                    className={cn(
                      "w-full text-left px-3 py-1.5 text-sm hover:bg-muted",
                      statusFilter === opt && "bg-accent text-accent-foreground font-medium",
                    )}
                  >
                    {opt}
                  </button>
                ))}
              </div>
            )}
          </div>
        </div>

        {/* Table */}
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="text-left text-xs uppercase tracking-wide text-muted-foreground bg-muted/50">
                <th className="px-5 py-3 font-medium">
                  <button className="inline-flex items-center gap-1 hover:text-foreground">
                    Integration Name <ArrowUpDown className="h-3 w-3" />
                  </button>
                </th>
                <th className="px-5 py-3 font-medium">Type</th>
                <th className="px-5 py-3 font-medium">Category</th>
                <th className="px-5 py-3 font-medium">Status</th>
                <th className="px-5 py-3 font-medium">Last Updated</th>
                <th className="px-5 py-3 font-medium">Point of Contact</th>
                <th className="px-5 py-3 font-medium text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-border">
              {visible.map((r) => (
                <tr key={r.id} className="hover:bg-muted/40 transition-colors group">
                  <td className="px-5 py-3.5">
                    <div className="font-medium text-foreground">{r.name}</div>
                    <div className="text-xs text-muted-foreground mt-0.5">{r.id}</div>
                  </td>
                  <td className="px-5 py-3.5"><TypePill type={r.type} /></td>
                  <td className="px-5 py-3.5 text-foreground">{r.category}</td>
                  <td className="px-5 py-3.5"><StatusBadge status={r.status} /></td>
                  <td className="px-5 py-3.5 text-muted-foreground">{r.updated}</td>
                  <td className="px-5 py-3.5">
                    <div className="flex items-center gap-2">
                      <div className="h-6 w-6 rounded-full bg-accent text-accent-foreground flex items-center justify-center text-[10px] font-semibold">
                        {r.contact.slice(0, 2).toUpperCase()}
                      </div>
                      <span className="text-muted-foreground">{r.contact}</span>
                    </div>
                  </td>
                  <td className="px-5 py-3.5">
                    <div className="flex items-center justify-end gap-1 opacity-70 group-hover:opacity-100 transition-opacity">
                      <button className="h-8 w-8 rounded-md hover:bg-muted flex items-center justify-center" title="View">
                        <Eye className="h-4 w-4 text-muted-foreground" />
                      </button>
                      <button className="h-8 w-8 rounded-md hover:bg-muted flex items-center justify-center" title="Edit">
                        <Pencil className="h-4 w-4 text-muted-foreground" />
                      </button>
                      <button className="h-8 w-8 rounded-md hover:bg-destructive/10 flex items-center justify-center" title="Delete">
                        <Trash2 className="h-4 w-4 text-destructive" />
                      </button>
                      <button className="h-8 w-8 rounded-md hover:bg-muted flex items-center justify-center">
                        <MoreHorizontal className="h-4 w-4 text-muted-foreground" />
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
              {visible.length === 0 && (
                <tr>
                  <td colSpan={7} className="px-5 py-16 text-center">
                    <div className="inline-flex flex-col items-center gap-2">
                      <div className="h-12 w-12 rounded-full bg-muted flex items-center justify-center">
                        <Search className="h-5 w-5 text-muted-foreground" />
                      </div>
                      <div className="font-medium text-foreground">No integrations found</div>
                      <div className="text-sm text-muted-foreground">Try adjusting your filters or search query.</div>
                    </div>
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>

        {/* Pagination */}
        <div className="flex items-center justify-between px-5 py-3 border-t border-border text-sm">
          <div className="text-muted-foreground">
            Showing <span className="font-medium text-foreground">{(page - 1) * pageSize + 1}</span>–
            <span className="font-medium text-foreground">{Math.min(page * pageSize, total)}</span> of{" "}
            <span className="font-medium text-foreground">{total}</span> integrations
          </div>
          <div className="flex items-center gap-1">
            <button
              disabled={page === 1}
              onClick={() => setPage((p) => Math.max(1, p - 1))}
              className="h-8 px-2 rounded-md border border-input bg-background hover:bg-muted disabled:opacity-40 disabled:cursor-not-allowed inline-flex items-center"
            >
              <ChevronLeft className="h-4 w-4" />
            </button>
            {Array.from({ length: pageCount }).map((_, i) => (
              <button
                key={i}
                onClick={() => setPage(i + 1)}
                className={cn(
                  "h-8 w-8 rounded-md text-sm transition-colors",
                  page === i + 1
                    ? "bg-primary text-primary-foreground font-semibold"
                    : "hover:bg-muted text-muted-foreground",
                )}
              >
                {i + 1}
              </button>
            ))}
            <button
              disabled={page === pageCount}
              onClick={() => setPage((p) => Math.min(pageCount, p + 1))}
              className="h-8 px-2 rounded-md border border-input bg-background hover:bg-muted disabled:opacity-40 disabled:cursor-not-allowed inline-flex items-center"
            >
              <ChevronRight className="h-4 w-4" />
            </button>
          </div>
        </div>
      </div>

      <AddIntegrationModal open={modalOpen} onClose={() => setModalOpen(false)} />
    </div>
  );
}
