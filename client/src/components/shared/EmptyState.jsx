import { motion } from "framer-motion";
import {
  FolderOpen,
  Users,
  FolderKanban,
  ClipboardCheck,
  Bell,
  Briefcase,
  FileText,
  ClipboardList,
  Activity,
  SearchX,
  Plus,
  RefreshCw,
} from "lucide-react";

// ── Preset configs per context ────────────────────────────
const PRESETS = {
  tasks: {
    icon:        FolderKanban,
    title:       "No tasks yet",
    description: "Create your first task to get your team moving.",
    color:       "text-[#5B73FF]",
    bg:          "bg-[#5B73FF]/10",
    border:      "border-[#5B73FF]/15",
  },
  teams: {
    icon:        Briefcase,
    title:       "No teams yet",
    description: "Create a team to start organizing your workforce.",
    color:       "text-[#A78BFA]",
    bg:          "bg-[#A78BFA]/10",
    border:      "border-[#A78BFA]/15",
  },
  employees: {
    icon:        Users,
    title:       "No employees yet",
    description: "Add your first team member to get started.",
    color:       "text-[#22C97B]",
    bg:          "bg-[#22C97B]/10",
    border:      "border-[#22C97B]/15",
  },
  submissions: {
    icon:        FileText,
    title:       "No submissions yet",
    description: "Submitted work from your team will appear here.",
    color:       "text-[#F59E0B]",
    bg:          "bg-[#F59E0B]/10",
    border:      "border-[#F59E0B]/15",
  },
  attendance: {
    icon:        ClipboardCheck,
    title:       "No attendance records",
    description: "Attendance data will appear once your team clocks in.",
    color:       "text-[#22C97B]",
    bg:          "bg-[#22C97B]/10",
    border:      "border-[#22C97B]/15",
  },
  notifications: {
    icon:        Bell,
    title:       "You're all caught up",
    description: "No new notifications. Check back later.",
    color:       "text-[#5B73FF]",
    bg:          "bg-[#5B73FF]/10",
    border:      "border-[#5B73FF]/15",
  },
  reports: {
    icon:        ClipboardList,
    title:       "No reports submitted",
    description: "Daily reports from your team will appear here.",
    color:       "text-[#A78BFA]",
    bg:          "bg-[#A78BFA]/10",
    border:      "border-[#A78BFA]/15",
  },
  activity: {
    icon:        Activity,
    title:       "No activity yet",
    description: "Actions taken by your team will show up here in real time.",
    color:       "text-[#F59E0B]",
    bg:          "bg-[#F59E0B]/10",
    border:      "border-[#F59E0B]/15",
  },
  search: {
    icon:        SearchX,
    title:       "No results found",
    description: "Try adjusting your search or filters.",
    color:       "text-white/30",
    bg:          "bg-white/[0.04]",
    border:      "border-white/[0.06]",
  },
  default: {
    icon:        FolderOpen,
    title:       "Nothing here yet",
    description: "Data will appear here once it's been added.",
    color:       "text-white/30",
    bg:          "bg-white/[0.04]",
    border:      "border-white/[0.06]",
  },
};

// ── Action button ─────────────────────────────────────────
const ActionButton = ({ label, icon: Icon, onClick, variant = "primary" }) => {
  if (!label || !onClick) return null;

  const styles = {
    primary: "bg-[#5B73FF] hover:bg-[#4B63EE] text-white",
    ghost:   "bg-white/[0.05] hover:bg-white/[0.08] text-white/50 hover:text-white/80 border border-white/[0.07]",
  };

  return (
    <button
      onClick={onClick}
      className={`
        inline-flex items-center gap-2
        h-8 px-4 rounded-lg
        text-[12px] font-semibold
        transition-all duration-150
        ${styles[variant]}
      `}
    >
      {Icon && <Icon size={13} />}
      {label}
    </button>
  );
};

// ── EmptyState ────────────────────────────────────────────
// Props:
//   preset      — keyof PRESETS (auto-fills icon/title/description/colors)
//   icon        — override icon (lucide component)
//   title       — override title
//   description — override description
//   action      — { label, icon?, onClick }   primary CTA
//   secondary   — { label, icon?, onClick }   secondary CTA
//   size        — "sm" | "md" | "lg"  (default "md")
//   bordered    — wrap in a card border (default true)
const EmptyState = ({
  preset      = "default",
  icon,
  title,
  description,
  action,
  secondary,
  size     = "md",
  bordered = true,
}) => {
  const config  = PRESETS[preset] ?? PRESETS.default;
  const Icon    = icon  ?? config.icon;
  const heading = title ?? config.title;
  const body    = description ?? config.description;

  const sizeStyles = {
    sm: { wrap: "py-8  px-6",  icon: "w-9  h-9  rounded-xl", iconSize: 16, title: "text-[13px]", desc: "text-[12px]" },
    md: { wrap: "py-12 px-8",  icon: "w-11 h-11 rounded-xl", iconSize: 20, title: "text-[14px]", desc: "text-[13px]" },
    lg: { wrap: "py-16 px-10", icon: "w-14 h-14 rounded-2xl", iconSize: 24, title: "text-[16px]", desc: "text-[13px]" },
  };
  const s = sizeStyles[size] ?? sizeStyles.md;

  return (
    <motion.div
      initial={{ opacity: 0, y: 6  }}
      animate={{ opacity: 1, y: 0  }}
      transition={{ duration: 0.25, ease: "easeOut" }}
      className={`
        flex flex-col items-center justify-center text-center
        ${s.wrap}
        ${bordered
          ? `bg-[#1A1A24] border border-white/[0.07] rounded-2xl`
          : ""
        }
      `}
    >
      {/* ── Icon badge ── */}
      <div className={`
        flex items-center justify-center
        flex-shrink-0 mb-4
        border
        ${s.icon}
        ${config.bg}
        ${config.border}
      `}>
        <Icon size={s.iconSize} className={config.color} />
      </div>

      {/* ── Text ── */}
      <h3 className={`
        font-semibold text-white/80 leading-snug mb-1.5
        ${s.title}
      `}>
        {heading}
      </h3>
      <p className={`
        text-white/35 leading-relaxed max-w-xs
        ${s.desc}
      `}>
        {body}
      </p>

      {/* ── Actions ── */}
      {(action || secondary) && (
        <div className="flex items-center gap-2 mt-5">
          {secondary && (
            <ActionButton
              label={secondary.label}
              icon={secondary.icon ?? RefreshCw}
              onClick={secondary.onClick}
              variant="ghost"
            />
          )}
          {action && (
            <ActionButton
              label={action.label}
              icon={action.icon ?? Plus}
              onClick={action.onClick}
              variant="primary"
            />
          )}
        </div>
      )}
    </motion.div>
  );
};

export default EmptyState;