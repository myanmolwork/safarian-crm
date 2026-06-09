import { Circle, Timer, Eye, CheckCircle, XCircle, Ban } from "lucide-react";

// ── Status config ─────────────────────────────────────────
const STATUS_CONFIG = {
  TODO: {
    label:  "Todo",
    icon:   Circle,
    color:  "text-white/50",
    bg:     "bg-white/[0.06]",
    border: "border-white/[0.08]",
  },
  IN_PROGRESS: {
    label:  "In Progress",
    icon:   Timer,
    color:  "text-[#5B73FF]",
    bg:     "bg-[#5B73FF]/10",
    border: "border-[#5B73FF]/20",
  },
  IN_REVIEW: {
    label:  "In Review",
    icon:   Eye,
    color:  "text-[#F59E0B]",
    bg:     "bg-[#F59E0B]/10",
    border: "border-[#F59E0B]/20",
  },
  UNDER_REVIEW: {
    label:  "Under Review",
    icon:   Eye,
    color:  "text-[#F59E0B]",
    bg:     "bg-[#F59E0B]/10",
    border: "border-[#F59E0B]/20",
  },
  APPROVED: {
    label:  "Approved",
    icon:   CheckCircle,
    color:  "text-[#22C97B]",
    bg:     "bg-[#22C97B]/10",
    border: "border-[#22C97B]/20",
  },
  DONE: {
    label:  "Done",
    icon:   CheckCircle,
    color:  "text-[#22C97B]",
    bg:     "bg-[#22C97B]/10",
    border: "border-[#22C97B]/20",
  },
  REJECTED: {
    label:  "Rejected",
    icon:   XCircle,
    color:  "text-[#F43F5E]",
    bg:     "bg-[#F43F5E]/10",
    border: "border-[#F43F5E]/20",
  },
  CANCELLED: {
    label:  "Cancelled",
    icon:   Ban,
    color:  "text-white/30",
    bg:     "bg-white/[0.04]",
    border: "border-white/[0.06]",
  },
};

// ── StatusBadge ───────────────────────────────────────────
// Props:
//   status  — keyof STATUS_CONFIG
//   variant — "badge" | "dot" | "icon" (default "badge")
const StatusBadge = ({
  status,
  variant = "badge",
}) => {
  const config = STATUS_CONFIG[status] ?? {
    label:  status?.replace(/_/g, " ") ?? "Unknown",
    icon:   Circle,
    color:  "text-white/30",
    bg:     "bg-white/[0.04]",
    border: "border-white/[0.06]",
  };

  const Icon = config.icon;

  // ── Dot only ──
  if (variant === "dot") {
    return (
      <span
        title={config.label}
        className={`
          inline-flex items-center justify-center
          w-2 h-2 rounded-full flex-shrink-0
          ${config.bg}
        `}
      >
        <span className={`
          w-1.5 h-1.5 rounded-full
          ${config.color.replace("text-", "bg-")}
        `} />
      </span>
    );
  }

  // ── Icon only ──
  if (variant === "icon") {
    return (
      <span
        title={config.label}
        className={`
          inline-flex items-center justify-center
          w-5 h-5 rounded-md flex-shrink-0
          ${config.bg} ${config.color}
        `}
      >
        <Icon size={11} />
      </span>
    );
  }

  // ── Default: full badge ───────────────────────────────────
  return (
    <span className={`
      inline-flex items-center gap-1.5
      px-2 py-0.5 rounded-md
      text-[11px] font-semibold
      border flex-shrink-0
      ${config.color}
      ${config.bg}
      ${config.border}
    `}>
      <Icon size={10} className="flex-shrink-0" />
      {config.label}
    </span>
  );
};

export default StatusBadge;