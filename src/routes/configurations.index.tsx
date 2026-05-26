import { createFileRoute, Link } from "@tanstack/react-router";
import { useMemo, useState, useRef, useEffect } from "react";
import {
  Plus,
  Search,
  Filter,
  ChevronDown,
  ChevronRight,
  ChevronLeft,
  MoreVertical,
  ArrowUpDown,
  Home,
  X,
  Check,
  Pencil,
  Trash2,
  ToggleRight,
  ToggleLeft,
  Menu,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import { AddIntegrationModal } from "@/components/integrations/AddIntegrationModal";
import { Toaster } from "@/components/ui/sonner";
import { toast } from "sonner";

export const Route = createFileRoute("/configurations/")({
  component: ConfigurationsListPage,
});

type Status = "Active" | "Inactive" | "Error";
type IntegrationType = "Push Integration" | "Pull Integration" | "File Integration" | "Document Integration";
type Entity = "Booking" | "Documents" | "Guest" | "Invoice" | "Lead" | "Ticket";
type TriggerType = "Change" | "CreateOrChange" | "Create" | "Delete";
type ActionType = "HTTP Service" | "HTTP Service External" | "FTP" | "SFTP" | "Webhook";

const STATUS_OPTIONS = ["All", "Active Only", "Inactive Only", "Error Only"] as const;
const TRIGGER_OPTIONS = ["All", "Change", "CreateOrChange", "Create", "Delete"] as const;
const ENTITY_OPTIONS = ["All", "Booking", "Documents", "Guest", "Invoice", "Lead", "Ticket"] as const;
const ACTION_OPTIONS = ["All", "HTTP Service", "HTTP Service External", "FTP", "SFTP", "Webhook"] as const;

function FilterSelect({
  label,
  value,
  onChange,
  options,
  placeholder,
}: {
  label: string;
  value: string;
  onChange: (v: string) => void;
  options: readonly string[];
  placeholder: string;
}) {
  const [open, setOpen] = useState(false);
  const ref = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!open) return;
    const handler = (e: MouseEvent) => {
      if (ref.current && !ref.current.contains(e.target as Node)) setOpen(false);
    };
    document.addEventListener("mousedown", handler);
    return () => document.removeEventListener("mousedown", handler);
  }, [open]);

  return (
    <div className="space-y-1.5">
      <label className="block text-sm font-medium text-foreground">{label}</label>
      <div ref={ref} className="relative">
        <button
          type="button"
          onClick={() => setOpen((v) => !v)}
          className={cn(
            "w-full h-10 px-3 rounded-md border border-input bg-background text-sm flex items-center justify-between",
            "hover:border-primary/50 transition-colors",
            open && "ring-2 ring-primary/30 border-primary",
          )}
        >
          <span className={value !== "All" ? "text-foreground" : "text-muted-foreground"}>
            {value === "All" ? placeholder : value}
          </span>
          <ChevronDown className={cn("h-4 w-4 text-muted-foreground transition-transform", open && "rotate-180")} />
        </button>
        {open && (
          <div className="absolute z-50 mt-1 w-full rounded-md border border-border bg-popover shadow-lg py-1 max-h-48 overflow-y-auto animate-in fade-in-0 zoom-in-95">
            {options.map((opt) => (
              <button
                key={opt}
                type="button"
                onClick={() => {
                  onChange(opt);
                  setOpen(false);
                }}
                className={cn(
                  "w-full text-left px-3 py-2 text-sm hover:bg-muted flex items-center justify-between",
                  value === opt && "bg-primary/10 text-primary font-medium",
                )}
              >
                {opt === "All" ? placeholder : opt}
                {value === opt && <Check className="h-3.5 w-3.5 text-primary" />}
              </button>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}

interface Row {
  id: string;
  name: string;
  entity: Entity;
  integrationType: IntegrationType;
  triggerType: TriggerType;
  status: Status;
  actionType: ActionType;
}

const INITIAL_ROWS: Row[] = [
  { id: "INT-1042", name: "Salesforce - HTTP", entity: "Booking", integrationType: "Push Integration", triggerType: "Change", status: "Active", actionType: "HTTP Service" },
  { id: "INT-1041", name: "Optimo Test Salesforce", entity: "Booking", integrationType: "Push Integration", triggerType: "Change", status: "Active", actionType: "HTTP Service External" },
  { id: "INT-1039", name: "Salesforce_Credentials", entity: "Booking", integrationType: "Push Integration", triggerType: "Change", status: "Active", actionType: "HTTP Service External" },
  { id: "INT-1037", name: "Salesforce_HTTP", entity: "Booking", integrationType: "Push Integration", triggerType: "CreateOrChange", status: "Active", actionType: "HTTP Service" },
  { id: "INT-1035", name: "FTP check", entity: "Booking", integrationType: "Push Integration", triggerType: "CreateOrChange", status: "Active", actionType: "FTP" },
  { id: "INT-1031", name: "Check Booking", entity: "Booking", integrationType: "Push Integration", triggerType: "CreateOrChange", status: "Active", actionType: "HTTP Service External" },
  { id: "INT-1028", name: "Optimo_Salesforce_Credentials", entity: "Documents", integrationType: "Push Integration", triggerType: "CreateOrChange", status: "Active", actionType: "HTTP Service" },
  { id: "INT-1024", name: "Booking Get", entity: "Booking", integrationType: "Push Integration", triggerType: "Change", status: "Active", actionType: "HTTP Service External" },
  { id: "INT-1019", name: "Guest Document Upload", entity: "Documents", integrationType: "Document Integration", triggerType: "Create", status: "Inactive", actionType: "SFTP" },
];

const StatusBadge = ({ status }: { status: Status }) => {
  const cls = {
    Active: "bg-success/10 text-success border-success/30",
    Inactive: "bg-muted text-muted-foreground border-border",
    Error: "bg-destructive/10 text-destructive border-destructive/30",
  }[status];
  return (
    <span className={cn("inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium border", cls)}>
      {status}
    </span>
  );
};




function ConfigurationsListPage() {
  const [rows, setRows] = useState<Row[]>(INITIAL_ROWS);
  const [query, setQuery] = useState("");
  const [modalOpen, setModalOpen] = useState(false);
  const [filterOpen, setFilterOpen] = useState(false);
  const [openMenuId, setOpenMenuId] = useState<string | null>(null);
  const [deleteConfirmId, setDeleteConfirmId] = useState<string | null>(null);
  const [selectedIds, setSelectedIds] = useState<Set<string>>(new Set());
  const [bulkMenuOpen, setBulkMenuOpen] = useState(false);
  const [bulkDeleteConfirm, setBulkDeleteConfirm] = useState(false);
  const [page, setPage] = useState(1);
  const pageSize = 8;

  // Applied filters
  const [statusFilter, setStatusFilter] = useState("All");
  const [triggerFilter, setTriggerFilter] = useState("All");
  const [entityFilter, setEntityFilter] = useState("All");
  const [actionFilter, setActionFilter] = useState("All");

  // Temporary filters (inside the popup before Apply)
  const [tmpStatus, setTmpStatus] = useState("All");
  const [tmpTrigger, setTmpTrigger] = useState("All");
  const [tmpEntity, setTmpEntity] = useState("All");
  const [tmpAction, setTmpAction] = useState("All");

  const activeFilterCount = [statusFilter, triggerFilter, entityFilter, actionFilter].filter((f) => f !== "All").length;

  const openFilterPopup = () => {
    setTmpStatus(statusFilter);
    setTmpTrigger(triggerFilter);
    setTmpEntity(entityFilter);
    setTmpAction(actionFilter);
    setFilterOpen(true);
  };

  const applyFilters = () => {
    setStatusFilter(tmpStatus);
    setTriggerFilter(tmpTrigger);
    setEntityFilter(tmpEntity);
    setActionFilter(tmpAction);
    setPage(1);
    setFilterOpen(false);
  };

  const resetFilters = () => {
    setTmpStatus("All");
    setTmpTrigger("All");
    setTmpEntity("All");
    setTmpAction("All");
    setStatusFilter("All");
    setTriggerFilter("All");
    setEntityFilter("All");
    setActionFilter("All");
    setPage(1);
    setFilterOpen(false);
  };

  const resolveStatus = (s: string): Status | "All" => {
    if (s === "Active Only") return "Active";
    if (s === "Inactive Only") return "Inactive";
    if (s === "Error Only") return "Error";
    return "All";
  };

  const filtered = useMemo(() => {
    const status = resolveStatus(statusFilter);
    return rows.filter(
      (r) =>
        (status === "All" || r.status === status) &&
        (triggerFilter === "All" || r.triggerType === triggerFilter) &&
        (entityFilter === "All" || r.entity === entityFilter) &&
        (actionFilter === "All" || r.actionType === actionFilter) &&
        (query === "" || r.name.toLowerCase().includes(query.toLowerCase()) || r.id.includes(query)),
    );
  }, [rows, query, statusFilter, triggerFilter, entityFilter, actionFilter]);

  const handleActivate = (id: string) => {
    setRows((prev) => prev.map((r) => r.id === id ? { ...r, status: "Active" as Status } : r));
    const row = rows.find((r) => r.id === id);
    toast.success(`${row?.name} activated`);
    setOpenMenuId(null);
  };

  const handleDeactivate = (id: string) => {
    setRows((prev) => prev.map((r) => r.id === id ? { ...r, status: "Inactive" as Status } : r));
    const row = rows.find((r) => r.id === id);
    toast.success(`${row?.name} deactivated`);
    setOpenMenuId(null);
  };

  const handleDelete = (id: string) => {
    setOpenMenuId(null);
    setDeleteConfirmId(id);
  };

  const confirmDelete = () => {
    if (!deleteConfirmId) return;
    const row = rows.find((r) => r.id === deleteConfirmId);
    setRows((prev) => prev.filter((r) => r.id !== deleteConfirmId));
    toast.success(`${row?.name} deleted`);
    setDeleteConfirmId(null);
    setSelectedIds((prev) => { const next = new Set(prev); next.delete(deleteConfirmId); return next; });
  };

  const toggleSelect = (id: string) => {
    setSelectedIds((prev) => {
      const next = new Set(prev);
      if (next.has(id)) next.delete(id); else next.add(id);
      return next;
    });
  };

  const toggleSelectAll = () => {
    const visibleIds = visible.map((r) => r.id);
    const allSelected = visibleIds.every((id) => selectedIds.has(id));
    if (allSelected) {
      setSelectedIds((prev) => {
        const next = new Set(prev);
        visibleIds.forEach((id) => next.delete(id));
        return next;
      });
    } else {
      setSelectedIds((prev) => {
        const next = new Set(prev);
        visibleIds.forEach((id) => next.add(id));
        return next;
      });
    }
  };

  const bulkActivate = () => {
    setRows((prev) => prev.map((r) => selectedIds.has(r.id) ? { ...r, status: "Active" as Status } : r));
    toast.success(`${selectedIds.size} integration${selectedIds.size > 1 ? "s" : ""} activated`);
    setSelectedIds(new Set());
    setBulkMenuOpen(false);
  };

  const bulkDeactivate = () => {
    setRows((prev) => prev.map((r) => selectedIds.has(r.id) ? { ...r, status: "Inactive" as Status } : r));
    toast.success(`${selectedIds.size} integration${selectedIds.size > 1 ? "s" : ""} deactivated`);
    setSelectedIds(new Set());
    setBulkMenuOpen(false);
  };

  const bulkDelete = () => {
    setBulkMenuOpen(false);
    setBulkDeleteConfirm(true);
  };

  const confirmBulkDelete = () => {
    const count = selectedIds.size;
    setRows((prev) => prev.filter((r) => !selectedIds.has(r.id)));
    toast.success(`${count} integration${count > 1 ? "s" : ""} deleted`);
    setSelectedIds(new Set());
    setBulkDeleteConfirm(false);
  };

  const isMulti = selectedIds.size > 1;

  const total = filtered.length;
  const pageCount = Math.max(1, Math.ceil(total / pageSize));
  const visible = filtered.slice((page - 1) * pageSize, page * pageSize);


  return (
    <div className="min-h-screen bg-muted/40">
      <Toaster richColors position="top-right" />
      {/* Top Header */}
      <header className="h-16 sticky top-0 z-30 bg-card/90 backdrop-blur border-b border-border">
        <div className="max-w-[1400px] mx-auto h-full flex items-center justify-between px-6">
          <div className="flex items-center gap-8">
            <Link to="/configurations" className="text-xl font-black tracking-tight text-foreground">
              OPTIMO
            </Link>
          </div>
          <div className="flex items-center gap-3">
            <div className="h-8 w-8 rounded-full bg-accent text-accent-foreground flex items-center justify-center text-xs font-semibold">
              OU
            </div>
            <div className="text-sm hidden sm:block">
              <div className="font-medium text-foreground leading-tight">Optimo User</div>
              <div className="text-xs text-muted-foreground leading-tight">Administrator</div>
            </div>
          </div>
        </div>
      </header>

      <div className="px-6 py-8">
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
          <Button size="sm" onClick={() => setModalOpen(true)} className="shadow-sm">
            <Plus className="h-4 w-4" />
            Add Integration
          </Button>
        </div>
      </div>




      {/* Filters bar */}
      <div className="rounded-xl border border-border bg-card shadow-[var(--shadow-soft)]">
        <div className="p-4 flex items-center gap-3 flex-wrap border-b border-border">
          <div className="relative flex-1 min-w-[240px]">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
            <input
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              placeholder="Search Integrations by Name"
              className="w-full h-9 pl-9 pr-3 rounded-md border border-input bg-background text-sm focus:outline-none focus:ring-2 focus:ring-ring/40"
            />
          </div>

          <button
            onClick={openFilterPopup}
            className="relative inline-flex items-center justify-center h-9 w-9 rounded-md border border-input bg-background hover:bg-muted transition-colors"
            title="Advanced Filter"
          >
            <Filter className="h-4 w-4 text-muted-foreground" />
            {activeFilterCount > 0 && (
              <span className="absolute -top-1.5 -right-1.5 h-4 w-4 rounded-full bg-primary text-primary-foreground text-[10px] font-bold flex items-center justify-center">
                {activeFilterCount}
              </span>
            )}
          </button>
          <button
            className="inline-flex items-center justify-center h-9 w-9 rounded-md border border-input bg-background hover:bg-muted transition-colors"
            title="Search"
          >
            <Search className="h-4 w-4 text-muted-foreground" />
          </button>

          {/* Bulk actions hamburger menu */}
          <div className="relative">
            <button
              onClick={() => {
                if (selectedIds.size === 0) {
                  toast.info("Select integrations first", { description: "Use the checkboxes to select rows." });
                  return;
                }
                setBulkMenuOpen((v) => !v);
              }}
              className={cn(
                "inline-flex items-center justify-center h-9 w-9 rounded-md border border-input bg-background hover:bg-muted transition-colors",
                selectedIds.size > 0 && "border-primary bg-primary/5",
              )}
              title="Bulk Actions"
            >
              <Menu className="h-4 w-4 text-muted-foreground" />
            </button>
            {bulkMenuOpen && selectedIds.size > 0 && (
              <>
                <div className="fixed inset-0 z-30" onClick={() => setBulkMenuOpen(false)} />
                <div className="absolute right-0 top-full mt-1 w-44 rounded-lg border border-border bg-popover shadow-lg z-40 py-1 animate-in fade-in-0 zoom-in-95">
                  <button
                    onClick={bulkDelete}
                    className="w-full text-left px-3 py-2 text-sm hover:bg-muted flex items-center gap-2.5 text-foreground"
                  >
                    <Trash2 className="h-3.5 w-3.5 text-destructive" />
                    {isMulti ? "Delete All" : "Delete"}
                  </button>
                  <button
                    onClick={bulkActivate}
                    className="w-full text-left px-3 py-2 text-sm hover:bg-muted flex items-center gap-2.5 text-foreground"
                  >
                    <ToggleRight className="h-3.5 w-3.5 text-success" />
                    {isMulti ? "Activate All" : "Activate"}
                  </button>
                  <button
                    onClick={bulkDeactivate}
                    className="w-full text-left px-3 py-2 text-sm hover:bg-muted flex items-center gap-2.5 text-foreground"
                  >
                    <ToggleLeft className="h-3.5 w-3.5 text-muted-foreground" />
                    {isMulti ? "Deactivate All" : "Deactivate"}
                  </button>
                </div>
              </>
            )}
          </div>
        </div>

      {/* Advanced Filter Modal */}
      {filterOpen && (
        <>
          <div className="fixed inset-0 z-40 bg-black/40" onClick={() => setFilterOpen(false)} />
          <div className="fixed z-50 top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-full max-w-md animate-in fade-in-0 zoom-in-95">
            <div className="rounded-xl border border-border bg-card shadow-2xl overflow-hidden">
              {/* Header */}
              <div className="flex items-center justify-between px-6 py-4 bg-primary">
                <h2 className="text-base font-semibold text-primary-foreground">Advanced Filter</h2>
                <button
                  onClick={() => setFilterOpen(false)}
                  className="h-7 w-7 rounded-md hover:bg-white/20 flex items-center justify-center transition-colors"
                >
                  <X className="h-4 w-4 text-primary-foreground" />
                </button>
              </div>

              {/* Body */}
              <div className="px-6 py-5 space-y-4">
                <FilterSelect
                  label="Status"
                  value={tmpStatus}
                  onChange={setTmpStatus}
                  options={STATUS_OPTIONS}
                  placeholder="Select Status"
                />
                <FilterSelect
                  label="Trigger Type"
                  value={tmpTrigger}
                  onChange={setTmpTrigger}
                  options={TRIGGER_OPTIONS}
                  placeholder="Select Trigger Type"
                />
                <FilterSelect
                  label="Entity"
                  value={tmpEntity}
                  onChange={setTmpEntity}
                  options={ENTITY_OPTIONS}
                  placeholder="Select Entity"
                />
                <FilterSelect
                  label="Push Action"
                  value={tmpAction}
                  onChange={setTmpAction}
                  options={ACTION_OPTIONS}
                  placeholder="Select Push Action"
                />
              </div>

              {/* Footer */}
              <div className="flex items-center justify-end gap-3 px-6 py-4 border-t border-border">
                <Button variant="outline" size="sm" onClick={resetFilters}>
                  Reset
                </Button>
                <Button size="sm" onClick={applyFilters}>
                  Apply
                </Button>
              </div>
            </div>
          </div>
        </>
      )}

        {/* Table */}
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="text-left text-xs uppercase tracking-wide text-muted-foreground bg-muted/50">
                <th className="px-5 py-3 font-medium w-10">
                  <input
                    type="checkbox"
                    checked={visible.length > 0 && visible.every((r) => selectedIds.has(r.id))}
                    onChange={toggleSelectAll}
                    className="h-4 w-4 rounded border-input accent-primary cursor-pointer"
                  />
                </th>
                <th className="px-5 py-3 font-medium">
                  <button className="inline-flex items-center gap-1 hover:text-foreground">
                    Name <ArrowUpDown className="h-3 w-3" />
                  </button>
                </th>
                <th className="px-5 py-3 font-medium">Entity</th>
                <th className="px-5 py-3 font-medium">Integration Type</th>
                <th className="px-5 py-3 font-medium">Trigger Type</th>
                <th className="px-5 py-3 font-medium">Status</th>
                <th className="px-5 py-3 font-medium">Action Type</th>
                <th className="px-5 py-3 font-medium w-10"></th>
              </tr>
            </thead>
            <tbody className="divide-y divide-border">
              {visible.map((r) => (
                <tr key={r.id} className={cn("hover:bg-muted/40 transition-colors group", selectedIds.has(r.id) && "bg-primary/5")}>
                  <td className="px-5 py-3.5">
                    <input
                      type="checkbox"
                      checked={selectedIds.has(r.id)}
                      onChange={() => toggleSelect(r.id)}
                      className="h-4 w-4 rounded border-input accent-primary cursor-pointer"
                    />
                  </td>
                  <td className="px-5 py-3.5">
                    <button className="font-medium text-primary hover:underline text-left">
                      {r.name}
                    </button>
                  </td>
                  <td className="px-5 py-3.5 text-foreground">{r.entity}</td>
                  <td className="px-5 py-3.5 text-foreground">{r.integrationType}</td>
                  <td className="px-5 py-3.5 text-foreground">{r.triggerType}</td>
                  <td className="px-5 py-3.5"><StatusBadge status={r.status} /></td>
                  <td className="px-5 py-3.5 text-foreground">{r.actionType}</td>
                  <td className="px-5 py-3.5">
                    <div className="relative">
                      <button
                        onClick={() => setOpenMenuId(openMenuId === r.id ? null : r.id)}
                        className="h-8 w-8 rounded-md hover:bg-muted flex items-center justify-center"
                      >
                        <MoreVertical className="h-4 w-4 text-muted-foreground" />
                      </button>
                      {openMenuId === r.id && (
                        <>
                          <div className="fixed inset-0 z-30" onClick={() => setOpenMenuId(null)} />
                          <div className="absolute right-0 top-full mt-1 w-40 rounded-lg border border-border bg-popover shadow-lg z-40 py-1 animate-in fade-in-0 zoom-in-95">
                            <button
                              onClick={() => {
                                setOpenMenuId(null);
                                toast.info(`Edit ${r.name}`, { description: "Opening editor…" });
                              }}
                              className="w-full text-left px-3 py-2 text-sm hover:bg-muted flex items-center gap-2.5 text-foreground"
                            >
                              <Pencil className="h-3.5 w-3.5 text-primary" />
                              Edit
                            </button>
                            <button
                              onClick={() => handleDelete(r.id)}
                              className="w-full text-left px-3 py-2 text-sm hover:bg-muted flex items-center gap-2.5 text-foreground"
                            >
                              <Trash2 className="h-3.5 w-3.5 text-destructive" />
                              Delete
                            </button>
                            <button
                              onClick={() => handleActivate(r.id)}
                              className="w-full text-left px-3 py-2 text-sm hover:bg-muted flex items-center gap-2.5 text-foreground"
                            >
                              <ToggleRight className="h-3.5 w-3.5 text-success" />
                              Activate
                            </button>
                            <button
                              onClick={() => handleDeactivate(r.id)}
                              className="w-full text-left px-3 py-2 text-sm hover:bg-muted flex items-center gap-2.5 text-foreground"
                            >
                              <ToggleLeft className="h-3.5 w-3.5 text-muted-foreground" />
                              Deactivate
                            </button>
                          </div>
                        </>
                      )}
                    </div>
                  </td>
                </tr>
              ))}
              {visible.length === 0 && (
                <tr>
                  <td colSpan={8} className="px-5 py-16 text-center">
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

      {/* Delete Confirmation Modal */}
      {deleteConfirmId && (
        <>
          <div className="fixed inset-0 z-40 bg-black/40" onClick={() => setDeleteConfirmId(null)} />
          <div className="fixed z-50 top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-full max-w-sm animate-in fade-in-0 zoom-in-95">
            <div className="rounded-xl border border-border bg-card shadow-2xl overflow-hidden">
              <div className="px-6 py-5 space-y-3">
                <div className="h-12 w-12 rounded-full bg-destructive/10 flex items-center justify-center mx-auto">
                  <Trash2 className="h-5 w-5 text-destructive" />
                </div>
                <h3 className="text-lg font-semibold text-foreground text-center">Delete Integration</h3>
                <p className="text-sm text-muted-foreground text-center">
                  Are you sure you want to delete <span className="font-medium text-foreground">{rows.find((r) => r.id === deleteConfirmId)?.name}</span>? This action cannot be undone.
                </p>
              </div>
              <div className="flex items-center justify-end gap-3 px-6 py-4 border-t border-border">
                <Button variant="outline" size="sm" onClick={() => setDeleteConfirmId(null)}>
                  Cancel
                </Button>
                <Button size="sm" variant="destructive" onClick={confirmDelete}>
                  <Trash2 className="h-3.5 w-3.5" />
                  Delete
                </Button>
              </div>
            </div>
          </div>
        </>
      )}

      {/* Bulk Delete Confirmation Modal */}
      {bulkDeleteConfirm && (
        <>
          <div className="fixed inset-0 z-40 bg-black/40" onClick={() => setBulkDeleteConfirm(false)} />
          <div className="fixed z-50 top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-full max-w-sm animate-in fade-in-0 zoom-in-95">
            <div className="rounded-xl border border-border bg-card shadow-2xl overflow-hidden">
              <div className="px-6 py-5 space-y-3">
                <div className="h-12 w-12 rounded-full bg-destructive/10 flex items-center justify-center mx-auto">
                  <Trash2 className="h-5 w-5 text-destructive" />
                </div>
                <h3 className="text-lg font-semibold text-foreground text-center">
                  Delete {selectedIds.size} Integration{selectedIds.size > 1 ? "s" : ""}
                </h3>
                <p className="text-sm text-muted-foreground text-center">
                  Are you sure you want to delete <span className="font-medium text-foreground">{selectedIds.size}</span> selected integration{selectedIds.size > 1 ? "s" : ""}? This action cannot be undone.
                </p>
              </div>
              <div className="flex items-center justify-end gap-3 px-6 py-4 border-t border-border">
                <Button variant="outline" size="sm" onClick={() => setBulkDeleteConfirm(false)}>
                  Cancel
                </Button>
                <Button size="sm" variant="destructive" onClick={confirmBulkDelete}>
                  <Trash2 className="h-3.5 w-3.5" />
                  Delete {selectedIds.size > 1 ? "All" : ""}
                </Button>
              </div>
            </div>
          </div>
        </>
      )}
        </div>
      </div>
    </div>
  );
}
