import { ArrowDown, ArrowRight, ArrowUp, Zap } from "lucide-react";

// ── Priority config ───────────────────────────────────────
const PRIORITY_CONFIG = {
  LOW: {
    label:  "Low",
    icon:   ArrowDown,
    color:  "text-[#22C97B]",
    bg:     "bg-[#22C97B]/10",
    border: "border-[#22C97B]/20",
    dot:    "bg-[#22C97B]",
  },
  MEDIUM: {
    label:  "Medium",
    icon:   ArrowRight,
    color:  "text-[#5B73FF]",
    bg:     "bg-[#5B73FF]/10",
    border: "border-[#5B73FF]/20",
    dot:    "bg-[#5B73FF]",
  },
  HIGH: {
    label:  "High",
    icon:   ArrowUp,
    color:  "text-[#F59E0B]",
    bg:     "bg-[#F59E0B]/10",
    border: "border-[#F59E0B]/20",
    dot:    "bg-[#F59E0B]",
  },
  URGENT: {
    label:  "Urgent",
    icon:   Zap,
    color:  "text-[#F43F5E]",
    bg:     "bg-[#F43F5E]/10",
    border: "border-[#F43F5E]/20",
    dot:    "bg-[#F43F5E]",
  },
};

// ── PriorityBadge ─────────────────────────────────────────
// Props:
//   priority — "LOW" | "MEDIUM" | "HIGH" | "URGENT"
//   variant  — "badge" | "dot" | "icon" (default "badge")
const PriorityBadge = ({
  priority,
  variant = "badge",
}) => {
  const config = PRIORITY_CONFIG[priority] ?? PRIORITY_CONFIG.MEDIUM;
  const Icon   = config.icon;

  // ── Dot only — for tight spaces (table cells, kanban cards) ──
  if (variant === "dot") {
    return (
      <span
        title={config.label}
        className={`
          inline-block w-2 h-2 rounded-full flex-shrink-0
          ${config.dot}
        `}
      />
    );
  }

  // ── Icon only — for very tight spaces ──
  if (variant === "icon") {
    return (
      <span
        title={config.label}
        className={`
          inline-flex items-center justify-center
          w-5 h-5 rounded-md
          ${config.bg}
          ${config.color}
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
      border
      ${config.color}
      ${config.bg}
      ${config.border}
    `}>
      <Icon size={10} className="flex-shrink-0" />
      {config.label}
    </span>
  );
};

export default PriorityBadge;