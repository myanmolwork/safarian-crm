import { Crown, Briefcase, User } from "lucide-react";

// ── Role config ───────────────────────────────────────────
const ROLE_CONFIG = {
  BOSS: {
    label:  "Boss",
    icon:   Crown,
    color:  "text-[#F59E0B]",
    bg:     "bg-[#F59E0B]/10",
    border: "border-[#F59E0B]/20",
  },
  TEAM_LEADER: {
    label:  "Team Leader",
    icon:   Briefcase,
    color:  "text-[#A78BFA]",
    bg:     "bg-[#A78BFA]/10",
    border: "border-[#A78BFA]/20",
  },
  WORKER: {
    label:  "Worker",
    icon:   User,
    color:  "text-[#5B73FF]",
    bg:     "bg-[#5B73FF]/10",
    border: "border-[#5B73FF]/20",
  },
};

// ── RoleBadge ─────────────────────────────────────────────
// Props:
//   role    — "BOSS" | "TEAM_LEADER" | "WORKER"
//   variant — "badge" | "dot" | "icon" (default "badge")
const RoleBadge = ({
  role,
  variant = "badge",
}) => {
  const config = ROLE_CONFIG[role] ?? ROLE_CONFIG.WORKER;
  const Icon   = config.icon;

  // ── Dot only ──
  if (variant === "dot") {
    return (
      <span
        title={config.label}
        className={`
          inline-block w-2 h-2 rounded-full flex-shrink-0
          ${config.bg.replace("/10", "")}
        `}
      />
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

export default RoleBadge;