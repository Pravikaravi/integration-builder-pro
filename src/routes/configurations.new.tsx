import { createFileRoute, Link, useNavigate } from "@tanstack/react-router";
import { useState, useRef, useEffect, useCallback } from "react";
import {
  ArrowLeft,
  ChevronDown,
  ChevronRight,
  Check,
  Pencil,
  Eye,
  EyeOff,
  Plus,
  Home,
  Search as SearchIcon,
  X,
  AlertCircle,
  Zap,
  Upload,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import { toast } from "sonner";
import { Toaster } from "@/components/ui/sonner";

type IntType = "Push" | "Pull" | "File" | "Document";

export const Route = createFileRoute("/configurations/new")({
  validateSearch: (s: Record<string, unknown>) => ({
    type: (["Push", "Pull", "File", "Document"].includes(s.type as string) ? s.type : "Push") as IntType,
  }),
  component: NewIntegrationPage,
});

/* ─────────────── reusable controls ─────────────── */

const Label = ({ children, required }: { children: React.ReactNode; required?: boolean }) => (
  <label className="block text-sm font-medium text-foreground mb-1.5">
    {children}
    {required && <span className="text-destructive ml-0.5">*</span>}
  </label>
);

const Input = ({ className, ...p }: React.InputHTMLAttributes<HTMLInputElement>) => (
  <input
    {...p}
    className={cn(
      "w-full h-10 px-3 rounded-md border border-input bg-background text-sm transition-colors",
      "focus:outline-none focus:ring-2 focus:ring-ring/40 focus:border-ring",
      "placeholder:text-muted-foreground/60",
      className,
    )}
  />
);

const TextArea = ({ className, ...p }: React.TextareaHTMLAttributes<HTMLTextAreaElement>) => (
  <textarea
    {...p}
    className={cn(
      "w-full px-3 py-2 rounded-md border border-input bg-background text-sm transition-colors",
      "focus:outline-none focus:ring-2 focus:ring-ring/40 focus:border-ring",
      "placeholder:text-muted-foreground/60 resize-y min-h-[88px]",
      className,
    )}
  />
);

function Select<T extends string>({
  value,
  onChange,
  options,
  placeholder = "Select…",
  className,
}: {
  value: T | "";
  onChange: (v: T) => void;
  options: readonly T[];
  placeholder?: string;
  className?: string;
}) {
  const [open, setOpen] = useState(false);
  const triggerRef = useRef<HTMLButtonElement>(null);
  const [pos, setPos] = useState({ top: 0, left: 0, width: 0 });

  const updatePos = useCallback(() => {
    if (triggerRef.current) {
      const rect = triggerRef.current.getBoundingClientRect();
      setPos({ top: rect.bottom + 6, left: rect.left, width: rect.width });
    }
  }, []);

  useEffect(() => {
    if (open) {
      updatePos();
      window.addEventListener("scroll", updatePos, true);
      window.addEventListener("resize", updatePos);
      return () => {
        window.removeEventListener("scroll", updatePos, true);
        window.removeEventListener("resize", updatePos);
      };
    }
  }, [open, updatePos]);

  return (
    <div className={cn("relative", className)}>
      <button
        ref={triggerRef}
        type="button"
        onClick={() => setOpen((v) => !v)}
        className={cn(
          "w-full h-10 px-3 rounded-md border border-input bg-background text-sm flex items-center justify-between",
          "hover:border-ring/50 transition-colors",
          open && "ring-2 ring-ring/40 border-ring",
        )}
      >
        <span className={value ? "text-foreground" : "text-muted-foreground/60"}>
          {value || placeholder}
        </span>
        <ChevronDown className={cn("h-4 w-4 text-muted-foreground transition-transform", open && "rotate-180")} />
      </button>
      {open && (
        <>
          <div className="fixed inset-0 z-40" onClick={() => setOpen(false)} />
          <div
            className="fixed z-50 rounded-md border border-border bg-popover shadow-lg py-1 max-h-64 overflow-y-auto animate-in fade-in-0 zoom-in-95"
            style={{ top: pos.top, left: pos.left, width: pos.width }}
          >
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
                  value === opt && "bg-accent/50 text-accent-foreground font-medium",
                )}
              >
                {opt}
                {value === opt && <Check className="h-3.5 w-3.5" />}
              </button>
            ))}
          </div>
        </>
      )}
    </div>
  );
}

function SearchableSelect({
  value,
  onChange,
  options,
  placeholder,
}: {
  value: string;
  onChange: (v: string) => void;
  options: string[];
  placeholder?: string;
}) {
  const [open, setOpen] = useState(false);
  const [q, setQ] = useState("");
  const filtered = options.filter((o) => o.toLowerCase().includes(q.toLowerCase()));
  return (
    <div className="relative">
      <button
        type="button"
        onClick={() => setOpen((v) => !v)}
        className={cn(
          "w-full h-10 px-3 rounded-md border border-input bg-background text-sm flex items-center justify-between",
          "hover:border-ring/50 transition-colors",
          open && "ring-2 ring-ring/40 border-ring",
        )}
      >
        <span className={value ? "text-foreground" : "text-muted-foreground/60"}>{value || placeholder}</span>
        <ChevronDown className={cn("h-4 w-4 text-muted-foreground transition-transform", open && "rotate-180")} />
      </button>
      {open && (
        <>
          <div className="fixed inset-0 z-10" onClick={() => setOpen(false)} />
          <div className="absolute z-20 mt-1.5 w-full rounded-md border border-border bg-popover shadow-lg overflow-hidden animate-in fade-in-0 zoom-in-95">
            <div className="p-2 border-b border-border relative">
              <SearchIcon className="absolute left-4 top-1/2 -translate-y-1/2 h-3.5 w-3.5 text-muted-foreground" />
              <input
                autoFocus
                value={q}
                onChange={(e) => setQ(e.target.value)}
                placeholder="Search contacts…"
                className="w-full h-8 pl-7 pr-2 rounded border border-input bg-background text-sm focus:outline-none focus:ring-2 focus:ring-ring/40"
              />
            </div>
            <div className="max-h-56 overflow-y-auto py-1">
              {filtered.length === 0 && (
                <div className="px-3 py-4 text-sm text-muted-foreground text-center">No matches</div>
              )}
              {filtered.map((opt) => (
                <button
                  key={opt}
                  type="button"
                  onClick={() => {
                    onChange(opt);
                    setOpen(false);
                    setQ("");
                  }}
                  className={cn(
                    "w-full text-left px-3 py-2 text-sm hover:bg-muted flex items-center gap-2",
                    value === opt && "bg-accent/50 text-accent-foreground font-medium",
                  )}
                >
                  <div className="h-6 w-6 rounded-full bg-accent text-accent-foreground flex items-center justify-center text-[10px] font-semibold">
                    {opt.slice(0, 2).toUpperCase()}
                  </div>
                  {opt}
                  {value === opt && <Check className="h-3.5 w-3.5 ml-auto" />}
                </button>
              ))}
            </div>
          </div>
        </>
      )}
    </div>
  );
}

function MultiSelect({
  values,
  onChange,
  options,
  placeholder,
}: {
  values: string[];
  onChange: (v: string[]) => void;
  options: string[];
  placeholder?: string;
}) {
  const [open, setOpen] = useState(false);
  const toggle = (opt: string) =>
    onChange(values.includes(opt) ? values.filter((v) => v !== opt) : [...values, opt]);
  return (
    <div className="relative">
      <button
        type="button"
        onClick={() => setOpen((v) => !v)}
        className={cn(
          "w-full min-h-10 px-2 py-1.5 rounded-md border border-input bg-background text-sm flex items-center gap-1.5 flex-wrap",
          "hover:border-ring/50 transition-colors",
          open && "ring-2 ring-ring/40 border-ring",
        )}
      >
        {values.length === 0 && <span className="text-muted-foreground/60 px-1">{placeholder}</span>}
        {values.map((v) => (
          <span
            key={v}
            className="inline-flex items-center gap-1 px-2 py-0.5 rounded bg-accent text-accent-foreground text-xs font-medium"
            onClick={(e) => {
              e.stopPropagation();
              toggle(v);
            }}
          >
            {v}
            <X className="h-3 w-3" />
          </span>
        ))}
        <ChevronDown className={cn("h-4 w-4 text-muted-foreground ml-auto transition-transform", open && "rotate-180")} />
      </button>
      {open && (
        <>
          <div className="fixed inset-0 z-10" onClick={() => setOpen(false)} />
          <div className="absolute z-20 mt-1.5 w-full rounded-md border border-border bg-popover shadow-lg py-1 animate-in fade-in-0 zoom-in-95">
            {options.map((opt) => {
              const selected = values.includes(opt);
              return (
                <button
                  key={opt}
                  type="button"
                  onClick={() => toggle(opt)}
                  className="w-full text-left px-3 py-2 text-sm hover:bg-muted flex items-center gap-2"
                >
                  <div
                    className={cn(
                      "h-4 w-4 rounded border flex items-center justify-center transition-colors",
                      selected ? "bg-primary border-primary" : "border-input",
                    )}
                  >
                    {selected && <Check className="h-3 w-3 text-primary-foreground" />}
                  </div>
                  {opt}
                </button>
              );
            })}
          </div>
        </>
      )}
    </div>
  );
}

const Toggle = ({ checked, onChange }: { checked: boolean; onChange: (v: boolean) => void }) => (
  <button
    type="button"
    onClick={() => onChange(!checked)}
    className={cn(
      "relative inline-flex h-6 w-11 items-center rounded-full transition-colors",
      checked ? "bg-primary" : "bg-muted-foreground/30",
    )}
  >
    <span
      className={cn(
        "inline-block h-5 w-5 transform rounded-full bg-white shadow-sm transition-transform",
        checked ? "translate-x-5" : "translate-x-0.5",
      )}
    />
  </button>
);

const Checkbox = ({
  checked,
  onChange,
  label,
}: {
  checked: boolean;
  onChange: (v: boolean) => void;
  label: string;
}) => (
  <label className="inline-flex items-center gap-2 cursor-pointer text-sm">
    <button
      type="button"
      onClick={() => onChange(!checked)}
      className={cn(
        "h-4 w-4 rounded border flex items-center justify-center transition-all",
        checked ? "bg-primary border-primary" : "border-input bg-background hover:border-ring/50",
      )}
    >
      {checked && <Check className="h-3 w-3 text-primary-foreground" />}
    </button>
    <span className="text-foreground select-none">{label}</span>
  </label>
);

function PasswordInput({ value, onChange, placeholder }: { value: string; onChange: (v: string) => void; placeholder?: string }) {
  const [show, setShow] = useState(false);
  return (
    <div className="relative">
      <Input
        type={show ? "text" : "password"}
        value={value}
        onChange={(e) => onChange(e.target.value)}
        placeholder={placeholder}
        className="pr-10"
      />
      <button
        type="button"
        onClick={() => setShow((v) => !v)}
        className="absolute right-2 top-1/2 -translate-y-1/2 h-7 w-7 rounded hover:bg-muted flex items-center justify-center text-muted-foreground"
      >
        {show ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
      </button>
    </div>
  );
}

/* ─────────────── section shell ─────────────── */

type Status = "locked" | "active" | "complete";

function SectionCard({
  index,
  title,
  subtitle,
  status,
  isOpen,
  onEdit,
  summary,
  children,
}: {
  index: number;
  title: string;
  subtitle?: string;
  status: Status;
  isOpen: boolean;
  onEdit?: () => void;
  summary?: React.ReactNode;
  children?: React.ReactNode;
}) {
  if (status === "locked") return null;
  return (
    <div
      className={cn(
        "rounded-xl border bg-card shadow-[var(--shadow-soft)] transition-all animate-fade-in",
        isOpen ? "border-primary/40 ring-1 ring-primary/20 overflow-visible" : "border-border overflow-hidden",
      )}
    >
      <div className="flex items-center gap-4 px-6 py-4">
        <div
          className={cn(
            "h-9 w-9 rounded-full flex items-center justify-center text-sm font-semibold transition-colors shrink-0",
            status === "complete" && "bg-success text-success-foreground",
            status === "active" && "bg-primary text-primary-foreground",
          )}
        >
          {status === "complete" ? <Check className="h-4 w-4" /> : index}
        </div>
        <div className="flex-1 min-w-0">
          <div className="font-semibold text-foreground">{title}</div>
          {subtitle && <div className="text-xs text-muted-foreground mt-0.5">{subtitle}</div>}
        </div>
        {status === "complete" && !isOpen && onEdit && (
          <button
            onClick={onEdit}
            className="inline-flex items-center gap-1.5 text-xs font-medium text-foreground/70 hover:text-foreground px-3 py-1.5 rounded-md hover:bg-muted transition-colors"
          >
            <Pencil className="h-3.5 w-3.5" />
            Edit
          </button>
        )}
      </div>

      {status === "complete" && !isOpen && summary && (
        <div className="px-6 pb-5 -mt-1 pl-[68px]">{summary}</div>
      )}

      <div
        className={cn(
          "grid transition-all duration-300 ease-out",
          isOpen ? "grid-rows-[1fr] opacity-100" : "grid-rows-[0fr] opacity-0",
        )}
      >
        <div className={cn(isOpen ? "overflow-visible" : "overflow-hidden")}>
          <div className="px-6 pb-6 pt-2 border-t border-border">{children}</div>
        </div>
      </div>
    </div>
  );
}

/* ─────────────── validation helpers ─────────────── */

const isValidEmail = (v: string) => /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(v);
const isValidUrl = (v: string) => /^https?:\/\/.+/.test(v);

const FieldError = ({ show, message }: { show: boolean; message: string }) =>
  show ? <p className="text-xs text-destructive mt-1">{message}</p> : null;

/* ─────────────── data ─────────────── */

const CONTACTS = ["test1@mail.com", "test2@mail.com", "admin@mail.com"];
const ENTITY_TYPES = ["Booking", "Contact", "Client"] as const;
const TRIGGERS = ["DELETE", "UPDATE", "CREATE OR CHANGE"];
const ACTIONS = ["HTTP Service", "HTTP Service External", "FTP"] as const;
const METHODS = ["GET", "POST", "PUT", "DELETE", "PATCH"] as const;
const OPERATIONS = ["api/v4.1/bookings", "api/v4.1/contact"] as const;
const EXISTING_INTEGRATIONS = [
  "Salesforce - HTTP",
  "Optimo Test Salesforce",
  "Salesforce_Credentials",
  "Salesforce_HTTP",
  "FTP check",
  "Check Booking",
  "Optimo_Salesforce_Credentials",
  "Booking Get",
  "Guest Document Upload",
];

/* ─────────────── destination subforms ─────────────── */

interface FtpForm {
  description: string;
  prefix: string;
  inbound: boolean;
  inboundUrl: string;
  inboundUser: string;
  inboundPwd: string;
  outbound: boolean;
  outboundUrl: string;
  outboundUser: string;
  outboundPwd: string;
}
const defaultFtp = (): FtpForm => ({
  description: "", prefix: "", inbound: false, inboundUrl: "", inboundUser: "", inboundPwd: "",
  outbound: false, outboundUrl: "", outboundUser: "", outboundPwd: "",
});

interface HttpForm {
  description: string;
  baseUrl: string;
  method: typeof METHODS[number];
  operation: typeof OPERATIONS[number] | "";
  username: string;
  password: string;
}
const defaultHttp = (): HttpForm => ({
  description: "", baseUrl: "", method: "POST", operation: "", username: "", password: "",
});

function FtpPanel({ form, set }: { form: FtpForm; set: (v: FtpForm) => void }) {
  return (
    <div className="rounded-lg border border-border bg-muted/20 p-5 space-y-5">
      <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
        <div>
          <Label>Description</Label>
          <Input value={form.description} onChange={(e) => set({ ...form, description: e.target.value })} placeholder="e.g. Nightly settlement drop" />
        </div>
        <div>
          <Label>File Name Prefix</Label>
          <Input value={form.prefix} onChange={(e) => set({ ...form, prefix: e.target.value })} placeholder="OPTIMO_SETTLE_" />
        </div>
      </div>

      {/* Inbound */}
      <div className="rounded-md border border-border bg-card">
        <div className="flex items-center justify-between p-4">
          <div>
            <div className="font-medium text-foreground text-sm">Inbound Configuration</div>
            <div className="text-xs text-muted-foreground">Pulls files from the remote server.</div>
          </div>
          <Toggle checked={form.inbound} onChange={(v) => set({ ...form, inbound: v })} />
        </div>
        <div className={cn("grid transition-all duration-300", form.inbound ? "grid-rows-[1fr]" : "grid-rows-[0fr]")}>
          <div className="overflow-hidden">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4 p-4 pt-0 border-t border-border">
              <div><Label>Base URL</Label><Input value={form.inboundUrl} onChange={(e) => set({ ...form, inboundUrl: e.target.value })} placeholder="sftp://files.example.com" /></div>
              <div><Label>Username</Label><Input value={form.inboundUser} onChange={(e) => set({ ...form, inboundUser: e.target.value })} placeholder="ftp-user" /></div>
              <div><Label>Password</Label><PasswordInput value={form.inboundPwd} onChange={(v) => set({ ...form, inboundPwd: v })} placeholder="••••••••" /></div>
            </div>
          </div>
        </div>
      </div>

      {/* Outbound */}
      <div className="rounded-md border border-border bg-card">
        <div className="flex items-center justify-between p-4">
          <div>
            <div className="font-medium text-foreground text-sm">Outbound Configuration</div>
            <div className="text-xs text-muted-foreground">Pushes files to the remote server.</div>
          </div>
          <Toggle checked={form.outbound} onChange={(v) => set({ ...form, outbound: v })} />
        </div>
        <div className={cn("grid transition-all duration-300", form.outbound ? "grid-rows-[1fr]" : "grid-rows-[0fr]")}>
          <div className="overflow-hidden">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4 p-4 pt-0 border-t border-border">
              <div><Label>Base URL</Label><Input value={form.outboundUrl} onChange={(e) => set({ ...form, outboundUrl: e.target.value })} placeholder="sftp://files.example.com" /></div>
              <div><Label>Username</Label><Input value={form.outboundUser} onChange={(e) => set({ ...form, outboundUser: e.target.value })} placeholder="ftp-user" /></div>
              <div><Label>Password</Label><PasswordInput value={form.outboundPwd} onChange={(v) => set({ ...form, outboundPwd: v })} placeholder="••••••••" /></div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

function HttpPanel({ form, set, removable, onRemove }: { form: HttpForm; set: (v: HttpForm) => void; removable?: boolean; onRemove?: () => void }) {
  const preview = `${form.method} ${form.baseUrl || "https://api.example.com"}${form.operation ? "/" + form.operation : ""}`;
  return (
    <div className="rounded-lg border border-border bg-muted/20 p-5 space-y-5 relative">
      {removable && (
        <button
          onClick={onRemove}
          className="absolute top-3 right-3 h-7 w-7 rounded-md hover:bg-destructive/10 text-destructive flex items-center justify-center"
          title="Remove destination"
        >
          <X className="h-4 w-4" />
        </button>
      )}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
        <div>
          <Label>Description</Label>
          <Input value={form.description} onChange={(e) => set({ ...form, description: e.target.value })} placeholder="Primary booking webhook" />
        </div>
        <div>
          <Label>Base URL</Label>
          <Input value={form.baseUrl} onChange={(e) => set({ ...form, baseUrl: e.target.value })} placeholder="https://demo.api.com" />
        </div>
        <div>
          <Label>Method</Label>
          <Select value={form.method} onChange={(v) => set({ ...form, method: v })} options={METHODS} />
        </div>
        <div>
          <Label>Operation</Label>
          <Select value={form.operation} onChange={(v) => set({ ...form, operation: v })} options={OPERATIONS} placeholder="Select endpoint" />
        </div>
        <div>
          <Label>Username</Label>
          <Input value={form.username} onChange={(e) => set({ ...form, username: e.target.value })} placeholder="service-account" />
        </div>
        <div>
          <Label>Password</Label>
          <PasswordInput value={form.password} onChange={(v) => set({ ...form, password: v })} placeholder="••••••••" />
        </div>
      </div>

      <div className="rounded-md border border-border bg-foreground/95 p-4 font-mono text-xs text-background">
        <div className="text-xs text-background/60 mb-1.5 font-sans">Request preview</div>
        <div className="flex items-center gap-2">
          <span className={cn("px-1.5 py-0.5 rounded text-[10px] font-semibold",
            form.method === "GET" && "bg-sky-500/20 text-sky-300",
            form.method === "POST" && "bg-emerald-500/20 text-emerald-300",
            form.method === "PUT" && "bg-amber-500/20 text-amber-300",
            form.method === "DELETE" && "bg-rose-500/20 text-rose-300",
            form.method === "PATCH" && "bg-violet-500/20 text-violet-300",
          )}>{form.method}</span>
          <span className="break-all">{form.baseUrl || "https://api.example.com"}{form.operation ? "/" + form.operation : ""}</span>
        </div>
      </div>
    </div>
  );
}

/* ─────────────── Mapping ─────────────── */

interface MapRow { id: string; source: string; target: string; type: string }

const SOURCE_FIELDS = ["booking.id", "booking.guestName", "booking.checkIn", "booking.checkOut", "booking.total", "booking.status", "contact.email", "contact.phone", "contact.name"];
const TARGET_FIELDS = ["id", "guest_name", "check_in_date", "check_out_date", "total_amount", "status", "email", "phone", "full_name"];

/* ─────────────── Main page ─────────────── */

function NewIntegrationPage() {
  const { type: initialType } = Route.useSearch();
  const navigate = useNavigate();

  // Section state
  const [active, setActive] = useState(1);
  const [completed, setCompleted] = useState<Set<number>>(new Set());
  const [attempted, setAttempted] = useState<Set<number>>(new Set());

  // Section 1
  const [name, setName] = useState("");
  const [type, setType] = useState<IntType>(initialType);
  const [isActive, setIsActive] = useState(true);
  const [contact, setContact] = useState("");
  const [description, setDescription] = useState("");
  const [notes, setNotes] = useState("");

  // Section 2 (Push config)
  const [entityType, setEntityType] = useState<string>("");
  const [sameAsCalling, setSameAsCalling] = useState(false);
  const [trigger, setTrigger] = useState<string>("");
  const [maxAttempts, setMaxAttempts] = useState(3);
  const [errorEmail, setErrorEmail] = useState("");
  const [query, setQuery] = useState("SELECT id, guest_name, check_in, total\nFROM bookings\nWHERE status = 'CONFIRMED';");

  // Section 2 (Pull config)
  const [nextIntegration, setNextIntegration] = useState<string>("");

  // Section 3 (Push destination)
  const [action, setAction] = useState<typeof ACTIONS[number] | "">("");
  const [ftp, setFtp] = useState<FtpForm>(defaultFtp);
  const [httpDestinations, setHttpDestinations] = useState<HttpForm[]>([defaultHttp()]);

  // Section 3 (Pull destination)
  const [pullApiUrl, setPullApiUrl] = useState("");

  // Section 4 — Mapping
  const [sourceTab, setSourceTab] = useState<"JSON" | "XML" | "Upload">("JSON");
  const [targetTab, setTargetTab] = useState<"JSON" | "XML" | "Upload">("JSON");
  const [sourcePayload, setSourcePayload] = useState("");
  const [targetPayload, setTargetPayload] = useState("");
  const [rows, setRows] = useState<MapRow[]>([]);

  const hasConfig = type === "Push" || type === "Pull";
  const isPush = type === "Push";
  const sectionTitles = ["General Details", hasConfig ? "Configuration" : null, "Destination Configuration", "Field Mapping"].filter(Boolean) as string[];
  const totalSections = hasConfig ? 4 : 3;

  // Validation
  const s1 = attempted.has(1);
  const section1Valid = !!(name.trim() && type && contact);

  const emailValid = errorEmail ? isValidEmail(errorEmail) : true;
  const s2 = attempted.has(2);
  const section2Valid = !hasConfig
    ? true
    : isPush
      ? !!(entityType && trigger && errorEmail && emailValid)
      : !!(errorEmail ? emailValid : true);

  const pullUrlValid = pullApiUrl ? isValidUrl(pullApiUrl) : false;
  const httpUrlValid = httpDestinations[0]?.baseUrl ? isValidUrl(httpDestinations[0].baseUrl) : false;
  const s3 = attempted.has(3);
  const section3Valid = isPush
    ? (action === "FTP"
        ? ftp.inbound || ftp.outbound
        : (action === "HTTP Service" || action === "HTTP Service External")
          ? !!(httpDestinations[0]?.baseUrl && httpUrlValid)
          : false)
    : !!(pullApiUrl.trim() && pullUrlValid);

  const s4 = attempted.has(4);
  const section4Valid = rows.length > 0 && rows.every((r) => r.source && r.target);

  const next = (n: number) => {
    setAttempted((s) => new Set([...s, n]));
    const valid = n === 1 ? section1Valid : n === 2 ? section2Valid : n === 3 ? section3Valid : section4Valid;
    if (!valid) return;
    setCompleted((s) => new Set([...s, n]));
    if (n === 1 && !hasConfig) {
      setActive(3);
    } else {
      setActive(n + 1);
    }
  };

  const statusFor = (n: number): Status =>
    completed.has(n) ? "complete" : active === n ? "active" : "locked";

  const updateRow = (id: string, patch: Partial<MapRow>) =>
    setRows((rs) => rs.map((r) => (r.id === id ? { ...r, ...patch } : r)));

  const addRow = () => setRows((rs) => [...rs, { id: crypto.randomUUID(), source: "", target: "", type: "string" }]);
  const removeRow = (id: string) => setRows((rs) => rs.filter((r) => r.id !== id));

  const parseSourcePayload = () => {
    try {
      const parsed = JSON.parse(sourcePayload);
      const keys = Object.keys(parsed);
      const newRows: MapRow[] = keys.map((k) => ({
        id: crypto.randomUUID(),
        source: k,
        target: "",
        type: typeof parsed[k] === "number" ? "number" : typeof parsed[k] === "boolean" ? "boolean" : "string",
      }));
      setRows(newRows);
      toast.success(`Parsed ${keys.length} fields from source payload`);
    } catch {
      toast.error("Invalid JSON", { description: "Please enter valid JSON in the source payload." });
    }
  };

  const parseTargetPayload = () => {
    try {
      const parsed = JSON.parse(targetPayload);
      const keys = Object.keys(parsed);
      if (rows.length === 0) {
        const newRows: MapRow[] = keys.map((k) => ({
          id: crypto.randomUUID(),
          source: "",
          target: k,
          type: typeof parsed[k] === "number" ? "number" : typeof parsed[k] === "boolean" ? "boolean" : "string",
        }));
        setRows(newRows);
      } else {
        setRows((prev) => prev.map((r, i) => i < keys.length ? { ...r, target: keys[i] } : r));
      }
      toast.success(`Parsed ${keys.length} fields from target payload`);
    } catch {
      toast.error("Invalid JSON", { description: "Please enter valid JSON in the target payload." });
    }
  };

  const autoMap = () => {
    if (rows.length === 0) {
      toast.info("No mappings to auto-map", { description: "Parse a source payload first." });
      return;
    }
    setRows((prev) =>
      prev.map((r) => {
        if (r.target) return r;
        const match = TARGET_FIELDS.find((t) =>
          t.toLowerCase().replace(/_/g, "") === r.source.split(".").pop()?.toLowerCase().replace(/_/g, ""),
        );
        return match ? { ...r, target: match } : r;
      }),
    );
    toast.success("Auto-mapped fields where possible");
  };

  // Section numbering (when config skipped, configuration is omitted)
  const Sx = hasConfig ? { general: 1, config: 2, dest: 3, map: 4 } : { general: 1, config: 0, dest: 2, map: 3 };

  // Saved integrations summary list (for "+ Add Next Integration")
  type SavedIntegration = { id: string; name: string; type: IntType; action: string };
  const [savedIntegrations, setSavedIntegrations] = useState<SavedIntegration[]>([]);

  const resetForm = () => {
    setName("");
    setContact("");
    setDescription("");
    setNotes("");
    setEntityType("");
    setTrigger("");
    setMaxAttempts(3);
    setErrorEmail("");
    setSameAsCalling(false);
    setNextIntegration("");
    setAction("");
    setFtp(defaultFtp());
    setHttpDestinations([defaultHttp()]);
    setPullApiUrl("");
    setSourcePayload("");
    setTargetPayload("");
    setSourceTab("JSON");
    setTargetTab("JSON");
    setRows([]);
    setCompleted(new Set());
    setAttempted(new Set());
    setActive(1);
  };

  const handleAddNextIntegration = () => {
    if (!name.trim()) {
      toast.error("Please complete General Details before adding another integration.");
      return;
    }
    setSavedIntegrations((s) => [
      ...s,
      { id: `INT-${1000 + s.length + 1}`, name, type, action: action || "—" },
    ]);
    toast.success(`${name} saved`, { description: "Starting a new integration form." });
    resetForm();
  };

  const handleSubmit = () => {
    toast.success("Integration created", {
      description: `${name} has been saved and is ${isActive ? "active" : "inactive"}.`,
    });
    setTimeout(() => navigate({ to: "/configurations" }), 600);
  };

  return (
    <div className="min-h-screen bg-muted/40">
      <Toaster richColors position="top-right" />
      {/* Top Header */}
      <header className="h-16 sticky top-0 z-30 bg-card/90 backdrop-blur border-b border-border">
        <div className="max-w-[1200px] mx-auto h-full flex items-center justify-between px-6">
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
        <div className="space-y-6 max-w-[1100px] mx-auto pb-24">
          {/* Breadcrumb */}
          <nav className="flex items-center gap-1.5 text-sm text-muted-foreground">
            <Home className="h-3.5 w-3.5" />
            <Link to="/configurations" className="hover:text-foreground">Configurations</Link>
            <ChevronRight className="h-3.5 w-3.5" />
            <Link to="/configurations" className="hover:text-foreground">Integration Configuration</Link>
            <ChevronRight className="h-3.5 w-3.5" />
            <span className="text-foreground font-medium">New Integration</span>
          </nav>

          {/* Saved Integrations Summary */}
          {savedIntegrations.length > 0 && (
            <div className="rounded-xl border border-border bg-card shadow-[var(--shadow-soft)] p-5 animate-fade-in">
              <div className="flex items-center justify-between mb-3">
                <div>
                  <div className="font-semibold text-foreground text-sm">
                    Saved Integrations in this session
                  </div>
                  <div className="text-xs text-muted-foreground mt-0.5">
                    These will be submitted together when you finish.
                  </div>
                </div>
                <span className="text-xs font-medium px-2 py-0.5 rounded-full bg-success/10 text-success border border-success/20">
                  {savedIntegrations.length} saved
                </span>
              </div>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3">
                {savedIntegrations.map((si) => (
                  <div key={si.id} className="rounded-lg border border-border bg-muted/30 p-3 flex items-start gap-3">
                    <div className="h-8 w-8 rounded-full bg-success text-success-foreground flex items-center justify-center shrink-0">
                      <Check className="h-4 w-4" />
                    </div>
                    <div className="min-w-0 flex-1">
                      <div className="font-medium text-foreground text-sm truncate">{si.name}</div>
                      <div className="text-xs text-muted-foreground mt-0.5">
                        {si.id} · {si.type}
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

      {/* Header */}
      <div className="flex items-start gap-3">
        <Link
          to="/configurations"
          className="h-10 w-10 rounded-md border border-input bg-card hover:bg-muted flex items-center justify-center transition-colors"
        >
          <ArrowLeft className="h-4 w-4" />
        </Link>
        <div className="flex-1">
          <h1 className="text-2xl font-bold tracking-tight text-foreground">Add New Integration</h1>
          <p className="text-sm text-muted-foreground mt-1">
            Complete each section in order. Sections will unlock as you progress.
          </p>
        </div>
        <div className="hidden md:flex items-center gap-2 text-sm">
          <span className="text-muted-foreground">Progress</span>
          <span className="font-semibold text-foreground">
            {completed.size} / {totalSections}
          </span>
          <div className="h-1.5 w-32 rounded-full bg-muted overflow-hidden">
            <div
              className="h-full bg-primary transition-all duration-500"
              style={{ width: `${(completed.size / totalSections) * 100}%` }}
            />
          </div>
        </div>
      </div>

      {/* SECTION 1 — General Details */}
      <SectionCard
        index={Sx.general}
        title="General Details"
        subtitle="Identify and categorise the integration."
        status={statusFor(1)}
        isOpen={active === 1}
        onEdit={() => setActive(1)}
        summary={
          <dl className="grid grid-cols-2 md:grid-cols-4 gap-x-6 gap-y-2 text-sm">
            <div><dt className="text-xs text-muted-foreground">Name</dt><dd className="font-medium text-foreground">{name}</dd></div>
            <div><dt className="text-xs text-muted-foreground">Type</dt><dd className="font-medium text-foreground">{type}</dd></div>
            <div><dt className="text-xs text-muted-foreground">Contact</dt><dd className="font-medium text-foreground">{contact}</dd></div>
          </dl>
        }
      >
        <div className="grid grid-cols-1 md:grid-cols-2 gap-5 mt-4">
          <div>
            <Label required>Integration Name</Label>
            <Input value={name} onChange={(e) => setName(e.target.value)} placeholder="e.g. Salesforce CRM Sync" className={s1 && !name.trim() ? "border-destructive" : ""} />
            <FieldError show={s1 && !name.trim()} message="Integration name is required." />
          </div>
          <div>
            <Label>Integration Type</Label>
            <div className="h-10 px-3 rounded-md border border-input bg-muted/30 text-sm flex items-center text-foreground font-medium">
              {type}
            </div>
          </div>
          <div>
            <Label required>Point of Contact</Label>
            <SearchableSelect value={contact} onChange={setContact} options={CONTACTS} placeholder="Select contact" />
            <FieldError show={s1 && !contact} message="Point of contact is required." />
          </div>
          <div className="md:col-span-2 flex items-center justify-between rounded-md border border-border bg-muted/30 px-4 py-3">
            <div>
              <div className="text-sm font-medium text-foreground">Is Active</div>
              <div className="text-xs text-muted-foreground">Inactive integrations will not be triggered by events.</div>
            </div>
            <Toggle checked={isActive} onChange={setIsActive} />
          </div>
          <div className="md:col-span-2">
            <Label>Description</Label>
            <TextArea value={description} onChange={(e) => setDescription(e.target.value)} placeholder="What does this integration do?" />
          </div>
          <div className="md:col-span-2">
            <Label>Notes</Label>
            <TextArea value={notes} onChange={(e) => setNotes(e.target.value)} placeholder="Internal notes, owners, escalation paths…" />
          </div>
        </div>
        <div className="mt-6 flex items-center justify-between">
          <div className="text-xs text-muted-foreground inline-flex items-center gap-1.5">
            {s1 && !section1Valid && <><AlertCircle className="h-3.5 w-3.5 text-destructive" /> Complete required fields to continue.</>}
          </div>
          <Button onClick={() => next(1)}>
            Next <ChevronRight className="h-4 w-4" />
          </Button>
        </div>
      </SectionCard>

      {/* SECTION 2 — Configuration */}
      {hasConfig && (
        <SectionCard
          index={2}
          title="Configuration"
          subtitle={isPush ? "Define when and how this push integration fires." : "Configure entity types and trigger settings"}
          status={statusFor(2)}
          isOpen={active === 2}
          onEdit={() => setActive(2)}
          summary={
            isPush ? (
              <dl className="grid grid-cols-2 md:grid-cols-4 gap-x-6 gap-y-2 text-sm">
                <div><dt className="text-xs text-muted-foreground">Entity</dt><dd className="font-medium text-foreground">{entityType}</dd></div>
                <div><dt className="text-xs text-muted-foreground">Trigger</dt><dd className="font-medium text-foreground">{trigger}</dd></div>
                <div><dt className="text-xs text-muted-foreground">Max Attempts</dt><dd className="font-medium text-foreground">{maxAttempts}</dd></div>
                <div><dt className="text-xs text-muted-foreground">Error Email</dt><dd className="font-medium text-foreground">{errorEmail}</dd></div>
              </dl>
            ) : (
              <dl className="grid grid-cols-2 md:grid-cols-3 gap-x-6 gap-y-2 text-sm">
                <div><dt className="text-xs text-muted-foreground">Max Attempts</dt><dd className="font-medium text-foreground">{maxAttempts}</dd></div>
                <div><dt className="text-xs text-muted-foreground">Error Email</dt><dd className="font-medium text-foreground">{errorEmail}</dd></div>
                <div><dt className="text-xs text-muted-foreground">Next Integration</dt><dd className="font-medium text-foreground">{nextIntegration || "—"}</dd></div>
              </dl>
            )
          }
        >
          {isPush ? (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-5 mt-4">
              <div>
                <Label required>Entity Type</Label>
                <Select value={entityType} onChange={setEntityType} options={ENTITY_TYPES} placeholder="Select entity" />
                <FieldError show={s2 && !entityType} message="Entity type is required." />
              </div>
              <div>
                <Label required>Trigger Type</Label>
                <Select value={trigger} onChange={setTrigger} options={TRIGGERS} placeholder="Select trigger" />
                <FieldError show={s2 && !trigger} message="Trigger type is required." />
              </div>
              <div className="md:col-span-2">
                <Checkbox checked={sameAsCalling} onChange={setSameAsCalling} label="Same as Calling Entity Type" />
              </div>
              <div>
                <Label>Max Re-Execution Attempts</Label>
                <Input type="number" min={0} value={maxAttempts} onChange={(e) => setMaxAttempts(Number(e.target.value))} />
              </div>
              <div>
                <Label required>Error Log Email</Label>
                <Input type="email" value={errorEmail} onChange={(e) => setErrorEmail(e.target.value)} placeholder="errors@company.com" className={s2 && (!errorEmail || !emailValid) ? "border-destructive" : ""} />
                <FieldError show={s2 && !errorEmail} message="Error log email is required." />
                <FieldError show={s2 && !!errorEmail && !emailValid} message="Enter a valid email address." />
              </div>
              <div className="md:col-span-2">
                <Label>Select Query</Label>
                <div className="rounded-md border border-input bg-foreground/95 overflow-hidden">
                  <div className="flex items-center justify-between px-4 py-2 border-b border-background/10 text-xs text-background/60 font-sans">
                    <span>SQL</span>
                    <span>{query.split("\n").length} lines</span>
                  </div>
                  <textarea
                    value={query}
                    onChange={(e) => setQuery(e.target.value)}
                    spellCheck={false}
                    className="w-full bg-transparent text-background font-mono text-sm p-4 min-h-[160px] resize-y focus:outline-none"
                  />
                </div>
              </div>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-5 mt-4">
              <div>
                <Label>Max Re-Execution Attempts</Label>
                <Input type="number" min={0} value={maxAttempts} onChange={(e) => setMaxAttempts(Number(e.target.value))} />
              </div>
              <div>
                <Label>Error Log Email</Label>
                <Input type="email" value={errorEmail} onChange={(e) => setErrorEmail(e.target.value)} placeholder="errors@company.com" className={s2 && errorEmail && !emailValid ? "border-destructive" : ""} />
                <FieldError show={s2 && !!errorEmail && !emailValid} message="Enter a valid email address." />
              </div>
              <div className="md:col-span-2">
                <Label>Next Integration</Label>
                <Select value={nextIntegration} onChange={setNextIntegration} options={EXISTING_INTEGRATIONS} placeholder="Select next integration" />
                <p className="text-xs text-muted-foreground mt-1.5">Select an integration to chain after this one</p>
              </div>
            </div>
          )}
          <div className="mt-6 flex items-center justify-between">
            <div className="flex items-center gap-3">
              <Button variant="outline" onClick={() => setActive(1)}>
                <ChevronRight className="h-4 w-4 rotate-180" /> Back
              </Button>
              {s2 && !section2Valid && (
                <span className="text-xs text-destructive inline-flex items-center gap-1.5">
                  <AlertCircle className="h-3.5 w-3.5" /> Complete required fields to continue.
                </span>
              )}
            </div>
            <Button onClick={() => next(2)}>
              Next <ChevronRight className="h-4 w-4" />
            </Button>
          </div>
        </SectionCard>
      )}

      {/* SECTION 3 — Destination */}
      <SectionCard
        index={Sx.dest}
        title={isPush ? "Destination Configuration" : "Destination"}
        subtitle={isPush ? "Where Optimo will deliver the payload." : "Configure API URL for pulling data"}
        status={statusFor(3)}
        isOpen={active === 3}
        onEdit={() => setActive(3)}
        summary={
          isPush ? (
            <dl className="grid grid-cols-2 md:grid-cols-3 gap-x-6 gap-y-2 text-sm">
              <div><dt className="text-xs text-muted-foreground">Action</dt><dd className="font-medium text-foreground">{action}</dd></div>
              {action !== "FTP" && (
                <div><dt className="text-xs text-muted-foreground">Destinations</dt><dd className="font-medium text-foreground">{httpDestinations.length}</dd></div>
              )}
            </dl>
          ) : (
            <dl className="grid grid-cols-1 gap-y-2 text-sm">
              <div><dt className="text-xs text-muted-foreground">API URL</dt><dd className="font-medium text-foreground">{pullApiUrl || "—"}</dd></div>
            </dl>
          )
        }
      >
        {isPush ? (
          <div className="mt-4 space-y-5">
            <div className="max-w-md">
              <Label required>Integration Action</Label>
              <Select value={action} onChange={(v) => setAction(v)} options={ACTIONS} placeholder="Select action" />
            </div>

            {action === "FTP" && <FtpPanel form={ftp} set={setFtp} />}

            {action === "HTTP Service" && (
              <HttpPanel
                form={httpDestinations[0]}
                set={(v) => setHttpDestinations([v])}
              />
            )}

            {action === "HTTP Service External" && (
              <div className="space-y-4">
                {httpDestinations.map((h, i) => (
                  <div key={i}>
                    <div className="flex items-center justify-between mb-2">
                      <div className="text-sm font-medium text-foreground inline-flex items-center gap-2">
                        <span className="h-5 w-5 rounded bg-accent text-accent-foreground text-xs flex items-center justify-center font-semibold">
                          {i + 1}
                        </span>
                        Destination {i + 1}
                      </div>
                    </div>
                    <HttpPanel
                      form={h}
                      set={(v) => setHttpDestinations((ds) => ds.map((d, idx) => (idx === i ? v : d)))}
                      removable={i > 0}
                      onRemove={() => setHttpDestinations((ds) => ds.filter((_, idx) => idx !== i))}
                    />
                  </div>
                ))}
                {httpDestinations.length < 2 && (
                  <Button
                    variant="outline"
                    onClick={() => setHttpDestinations((ds) => [...ds, defaultHttp()])}
                    className="w-full border-dashed"
                  >
                    <Plus className="h-4 w-4" />
                    Add Next Destination
                  </Button>
                )}
              </div>
            )}
          </div>
        ) : (
          <div className="mt-4">
            <div>
              <Label required>API URL</Label>
              <Input
                value={pullApiUrl}
                onChange={(e) => setPullApiUrl(e.target.value)}
                placeholder="https://api.example.com/endpoint"
                className={s3 && (!pullApiUrl.trim() || !pullUrlValid) ? "border-destructive" : ""}
              />
              <FieldError show={s3 && !pullApiUrl.trim()} message="API URL is required." />
              <FieldError show={s3 && !!pullApiUrl.trim() && !pullUrlValid} message="Enter a valid URL starting with http:// or https://" />
              {!(s3 && (!pullApiUrl.trim() || !pullUrlValid)) && (
                <p className="text-xs text-muted-foreground mt-1.5">Enter the API endpoint URL for pulling data from external source</p>
              )}
            </div>
          </div>
        )}
        <div className="mt-6 flex items-center justify-between gap-3 flex-wrap">
          <div className="flex items-center gap-3">
            <Button variant="outline" onClick={() => setActive(hasConfig ? 2 : 1)}>
              <ChevronRight className="h-4 w-4 rotate-180" /> Back
            </Button>
            {s3 && !section3Valid && (
              <span className="text-xs text-destructive inline-flex items-center gap-1.5">
                <AlertCircle className="h-3.5 w-3.5" /> {isPush ? "Select an action and configure destination." : "Enter a valid API URL."}
              </span>
            )}
          </div>
          <div className="flex items-center gap-2">
            <Button variant="outline" onClick={handleAddNextIntegration}>
              <Plus className="h-4 w-4" />
              Add Next Integration
            </Button>
            <Button onClick={() => next(3)}>
              Next <ChevronRight className="h-4 w-4" />
            </Button>
          </div>
        </div>
      </SectionCard>

      {/* SECTION 4 — Mapping */}
      <SectionCard
        index={Sx.map}
        title="Mapping"
        subtitle="Define how data fields are mapped between the source system and the destination system. Select fields from the source payload and connect them to the destination fields."
        status={statusFor(4)}
        isOpen={active === 4}
        onEdit={() => setActive(4)}
        summary={
          <div className="text-sm text-muted-foreground">
            <span className="font-medium text-foreground">{rows.length}</span> field{rows.length === 1 ? "" : "s"} mapped
          </div>
        }
      >
        <div className="mt-4 grid grid-cols-1 lg:grid-cols-[1fr_1.5fr_1fr] gap-4">
          {/* Source Payload */}
          <div className="rounded-lg border border-border bg-card">
            <div className="p-4 border-b border-border">
              <div className="flex items-center gap-2 mb-1">
                <span className="h-2.5 w-2.5 rounded-full bg-primary" />
                <span className="font-semibold text-foreground text-sm">Source Payload</span>
              </div>
              <p className="text-xs text-muted-foreground">Your system's data structure that will be sent to the 3rd party destination</p>
            </div>
            <div className="border-b border-border">
              <div className="flex">
                {(["JSON", "XML", "Upload"] as const).map((tab) => (
                  <button
                    key={tab}
                    onClick={() => setSourceTab(tab)}
                    className={cn(
                      "flex-1 text-xs font-medium py-2.5 transition-colors border-b-2",
                      sourceTab === tab ? "border-primary text-primary" : "border-transparent text-muted-foreground hover:text-foreground",
                    )}
                  >
                    {tab}
                  </button>
                ))}
              </div>
            </div>
            <div className="p-3">
              {sourceTab === "Upload" ? (
                <label className="flex flex-col items-center justify-center h-48 border-2 border-dashed border-input rounded-md cursor-pointer hover:border-primary/50 transition-colors">
                  <Upload className="h-6 w-6 text-muted-foreground mb-2" />
                  <span className="text-xs text-muted-foreground">Click to upload file</span>
                  <input type="file" className="hidden" accept=".json,.xml" onChange={(e) => {
                    const file = e.target.files?.[0];
                    if (file) {
                      const reader = new FileReader();
                      reader.onload = (ev) => { setSourcePayload(ev.target?.result as string); setSourceTab("JSON"); };
                      reader.readAsText(file);
                    }
                  }} />
                </label>
              ) : (
                <textarea
                  value={sourcePayload}
                  onChange={(e) => setSourcePayload(e.target.value)}
                  placeholder={`Paste your ${sourceTab} payload here...`}
                  spellCheck={false}
                  className="w-full h-48 px-3 py-2 rounded-md border border-input bg-background text-xs font-mono resize-none focus:outline-none focus:ring-2 focus:ring-ring/40 placeholder:text-muted-foreground/50"
                />
              )}
            </div>
            <div className="p-3 pt-0">
              <button
                onClick={parseSourcePayload}
                disabled={!sourcePayload.trim()}
                className="w-full h-9 rounded-md bg-primary text-primary-foreground text-sm font-medium hover:bg-primary/90 transition-colors disabled:opacity-40 disabled:cursor-not-allowed flex items-center justify-center gap-2"
              >
                <Zap className="h-3.5 w-3.5" />
                Parse Payload
              </button>
            </div>
          </div>

          {/* Field Mappings */}
          <div className="rounded-lg border border-border bg-card flex flex-col">
            <div className="p-4 border-b border-border">
              <div className="flex items-center justify-between mb-1">
                <div className="flex items-center gap-2">
                  <span className="h-2.5 w-2.5 rounded-full bg-blue-500" />
                  <span className="font-semibold text-foreground text-sm">Field Mappings</span>
                </div>
                <div className="flex items-center gap-2">
                  <span className="text-xs text-muted-foreground">{rows.filter((r) => r.source && r.target).length} mapped</span>
                  <button
                    onClick={autoMap}
                    className="h-7 px-3 rounded-md bg-emerald-500 text-white text-xs font-medium hover:bg-emerald-600 transition-colors flex items-center gap-1.5"
                  >
                    <Zap className="h-3 w-3" />
                    Auto-Map
                  </button>
                </div>
              </div>
              <p className="text-xs text-muted-foreground">Map source fields to destination fields</p>
            </div>
            <div className="flex-1 overflow-auto">
              <div className="grid grid-cols-[1fr_1fr_70px] text-[10px] uppercase tracking-wider text-muted-foreground font-semibold px-4 py-2 border-b border-border bg-muted/30">
                <div>Source Field</div>
                <div>Target Field</div>
                <div>Type</div>
              </div>
              <div className="divide-y divide-border">
                {rows.length === 0 && (
                  <div className="px-4 py-8 text-center text-xs text-muted-foreground">
                    No mappings yet. Parse a source payload or add a mapping manually.
                  </div>
                )}
                {rows.map((row) => (
                  <div key={row.id} className="grid grid-cols-[1fr_1fr_70px] items-center gap-2 px-4 py-2 hover:bg-muted/30 transition-colors group">
                    <Select value={row.source} onChange={(v) => updateRow(row.id, { source: v })} options={SOURCE_FIELDS} placeholder="Select source" />
                    <Select value={row.target} onChange={(v) => updateRow(row.id, { target: v })} options={TARGET_FIELDS} placeholder="Select target" />
                    <div className="flex items-center justify-between">
                      <span className="text-xs text-muted-foreground">{row.type}</span>
                      <button
                        onClick={() => removeRow(row.id)}
                        className="h-6 w-6 rounded hover:bg-destructive/10 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity"
                      >
                        <X className="h-3 w-3 text-destructive" />
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            </div>
            <div className="p-3 border-t border-border">
              <button
                onClick={addRow}
                className="w-full h-9 rounded-md bg-emerald-500 text-white text-sm font-medium hover:bg-emerald-600 transition-colors flex items-center justify-center gap-2"
              >
                <Plus className="h-3.5 w-3.5" />
                Add Mapping
              </button>
            </div>
          </div>

          {/* Target Payload */}
          <div className="rounded-lg border border-border bg-card">
            <div className="p-4 border-b border-border">
              <div className="flex items-center gap-2 mb-1">
                <span className="h-2.5 w-2.5 rounded-full bg-emerald-500" />
                <span className="font-semibold text-foreground text-sm">Target Payload</span>
              </div>
              <p className="text-xs text-muted-foreground">3rd party system's expected data structure (destination format)</p>
            </div>
            <div className="border-b border-border">
              <div className="flex">
                {(["JSON", "XML", "Upload"] as const).map((tab) => (
                  <button
                    key={tab}
                    onClick={() => setTargetTab(tab)}
                    className={cn(
                      "flex-1 text-xs font-medium py-2.5 transition-colors border-b-2",
                      targetTab === tab ? "border-emerald-500 text-emerald-600" : "border-transparent text-muted-foreground hover:text-foreground",
                    )}
                  >
                    {tab}
                  </button>
                ))}
              </div>
            </div>
            <div className="p-3">
              {targetTab === "Upload" ? (
                <label className="flex flex-col items-center justify-center h-48 border-2 border-dashed border-input rounded-md cursor-pointer hover:border-emerald-500/50 transition-colors">
                  <Upload className="h-6 w-6 text-muted-foreground mb-2" />
                  <span className="text-xs text-muted-foreground">Click to upload file</span>
                  <input type="file" className="hidden" accept=".json,.xml" onChange={(e) => {
                    const file = e.target.files?.[0];
                    if (file) {
                      const reader = new FileReader();
                      reader.onload = (ev) => { setTargetPayload(ev.target?.result as string); setTargetTab("JSON"); };
                      reader.readAsText(file);
                    }
                  }} />
                </label>
              ) : (
                <textarea
                  value={targetPayload}
                  onChange={(e) => setTargetPayload(e.target.value)}
                  placeholder={`Paste your target ${targetTab} payload here...`}
                  spellCheck={false}
                  className="w-full h-48 px-3 py-2 rounded-md border border-input bg-background text-xs font-mono resize-none focus:outline-none focus:ring-2 focus:ring-ring/40 placeholder:text-muted-foreground/50"
                />
              )}
            </div>
            <div className="p-3 pt-0">
              <button
                onClick={parseTargetPayload}
                disabled={!targetPayload.trim()}
                className="w-full h-9 rounded-md bg-emerald-500 text-white text-sm font-medium hover:bg-emerald-600 transition-colors disabled:opacity-40 disabled:cursor-not-allowed flex items-center justify-center gap-2"
              >
                <Zap className="h-3.5 w-3.5" />
                Parse Payload
              </button>
            </div>
          </div>
        </div>

        {/* Footer */}
        <div className="mt-6 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <Button variant="outline" onClick={() => setActive(3)}>
              <ChevronRight className="h-4 w-4 rotate-180" /> Back
            </Button>
            {s4 && !section4Valid && (
              <span className="text-xs text-destructive inline-flex items-center gap-1.5">
                <AlertCircle className="h-3.5 w-3.5" /> Add at least one complete mapping.
              </span>
            )}
          </div>
          <Button onClick={() => { setAttempted((s) => new Set([...s, 4])); if (section4Valid) handleSubmit(); }}>
            <Check className="h-4 w-4" />
            Submit Integration
          </Button>
        </div>
      </SectionCard>
        </div>
      </div>
    </div>
  );
}
