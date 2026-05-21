import { useNavigate } from "@tanstack/react-router";
import { useState } from "react";
import { X, Zap, Download, FileText, FileBox, ArrowRight, Check } from "lucide-react";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";

type IntType = "Push" | "Pull" | "File" | "Document";

const OPTIONS: { type: IntType; title: string; desc: string; Icon: typeof Zap; accent: string }[] = [
  { type: "Push", title: "Push", desc: "Send data outbound to a third-party system when events occur.", Icon: Zap, accent: "text-amber-600 bg-amber-50 border-amber-200" },
  { type: "Pull", title: "Pull", desc: "Periodically fetch data inbound from an external endpoint.", Icon: Download, accent: "text-sky-600 bg-sky-50 border-sky-200" },
  { type: "File", title: "File", desc: "Exchange flat files via SFTP, FTP, or shared drops.", Icon: FileText, accent: "text-emerald-600 bg-emerald-50 border-emerald-200" },
  { type: "Document", title: "Document", desc: "Receive structured documents like XML, PDF or EDI.", Icon: FileBox, accent: "text-violet-600 bg-violet-50 border-violet-200" },
];

export function AddIntegrationModal({ open, onClose }: { open: boolean; onClose: () => void }) {
  const [selected, setSelected] = useState<IntType | null>(null);
  const navigate = useNavigate();

  if (!open) return null;

  const handleContinue = () => {
    if (!selected) return;
    onClose();
    navigate({ to: "/configurations/new", search: { type: selected } as never });
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 animate-in fade-in-0">
      <div
        className="absolute inset-0 bg-foreground/40 backdrop-blur-sm"
        onClick={onClose}
      />
      <div className="relative w-full max-w-3xl rounded-2xl bg-card shadow-[var(--shadow-elevated)] border border-border animate-in zoom-in-95 slide-in-from-bottom-4">
        <div className="flex items-start justify-between p-6 border-b border-border">
          <div>
            <h2 className="text-lg font-semibold text-foreground">Select Integration Type</h2>
            <p className="text-sm text-muted-foreground mt-1">
              Choose how data will flow between Optimo and the connected system.
            </p>
          </div>
          <button
            onClick={onClose}
            className="h-8 w-8 rounded-md hover:bg-muted flex items-center justify-center text-muted-foreground"
          >
            <X className="h-4 w-4" />
          </button>
        </div>

        <div className="p-6 grid grid-cols-2 gap-4">
          {OPTIONS.map(({ type, title, desc, Icon, accent }) => {
            const active = selected === type;
            return (
              <button
                key={type}
                onClick={() => setSelected(type)}
                className={cn(
                  "group relative text-left rounded-xl border-2 p-5 transition-all duration-200",
                  active
                    ? "border-primary bg-accent/40 shadow-[var(--shadow-soft)]"
                    : "border-border bg-card hover:border-primary/50 hover:bg-muted/30",
                )}
              >
                {active && (
                  <div className="absolute top-3 right-3 h-6 w-6 rounded-full bg-primary text-primary-foreground flex items-center justify-center animate-in zoom-in-95">
                    <Check className="h-3.5 w-3.5" />
                  </div>
                )}
                <div className={cn("h-11 w-11 rounded-lg border flex items-center justify-center mb-3", accent)}>
                  <Icon className="h-5 w-5" />
                </div>
                <div className="font-semibold text-foreground">{title}</div>
                <div className="text-xs text-muted-foreground mt-1 leading-relaxed">{desc}</div>
              </button>
            );
          })}
        </div>

        <div className="flex items-center justify-between p-6 border-t border-border bg-muted/30 rounded-b-2xl">
          <div className="text-xs text-muted-foreground">
            You can change this later from the integration settings.
          </div>
          <div className="flex items-center gap-2">
            <Button variant="outline" onClick={onClose}>Cancel</Button>
            <Button onClick={handleContinue} disabled={!selected}>
              Continue <ArrowRight className="h-4 w-4" />
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
}
