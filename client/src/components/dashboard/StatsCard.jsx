import { TrendingUp, TrendingDown, Minus } from "lucide-react";
import { motion } from "framer-motion";

// ── Delta indicator ───────────────────────────────────────
// trend: "up" | "down" | "neutral"
const DeltaIndicator = ({ trend, subtitle }) => {
  const configs = {
    up: {
      icon:      TrendingUp,
      textColor: "text-[#22C97B]",
      bgColor:   "bg-[#22C97B]/10",
    },
    down: {
      icon:      TrendingDown,
      textColor: "text-[#F43F5E]",
      bgColor:   "bg-[#F43F5E]/10",
    },
    neutral: {
      icon:      Minus,
      textColor: "text-white/30",
      bgColor:   "bg-white/[0.04]",
    },
  };

  const { icon: Icon, textColor, bgColor } = configs[trend] ?? configs.neutral;

  return (
    <span
      className={`
        inline-flex items-center gap-1
        px-2 py-0.5 rounded-md
        text-[11px] font-medium
        ${textColor} ${bgColor}
      `}
    >
      <Icon size={10} />
      {subtitle}
    </span>
  );
};

// ── StatsCard ─────────────────────────────────────────────
// Props:
//   title    — string   e.g. "Active Employees"
//   value    — string   e.g. "48" or "87%"
//   subtitle — string   e.g. "+3 this month"
//   trend    — "up" | "down" | "neutral"  (default: "neutral")
//   icon     — lucide React component (optional)
//   accent   — tailwind bg class for the icon bg (optional)
const StatsCard = ({
  title,
  value,
  subtitle,
  trend    = "neutral",
  icon: Icon,
  accent   = "bg-[#5B73FF]/15",
  accentText = "text-[#5B73FF]",
}) => {
  return (
    <motion.div
      whileHover={{ y: -2 }}
      transition={{ duration: 0.15, ease: "easeOut" }}
      className="
        group relative
        bg-[#1A1A24]
        border border-white/[0.07]
        hover:border-white/[0.13]
        rounded-xl p-5
        transition-colors duration-150
        overflow-hidden
        cursor-default
      "
    >
      {/* ── Subtle corner glow on hover ── */}
      <div className="
        absolute -top-10 -right-10
        w-24 h-24 rounded-full
        bg-[#5B73FF]/5
        opacity-0 group-hover:opacity-100
        transition-opacity duration-300
        pointer-events-none
      " />

      {/* ── Header: title + icon ── */}
      <div className="flex items-center justify-between mb-4">
        <p className="
          text-[11px] font-semibold
          text-white/40
          uppercase tracking-widest
          select-none
        ">
          {title}
        </p>

        {Icon && (
          <div className={`
            flex items-center justify-center
            w-7 h-7 rounded-lg flex-shrink-0
            ${accent}
          `}>
            <Icon size={14} className={accentText} />
          </div>
        )}
      </div>

      {/* ── Value ── */}
      <p className="
        text-[28px] font-semibold
        text-white/90
        leading-none
        tabular-nums
        mb-3
      ">
        {value}
      </p>

      {/* ── Delta / subtitle ── */}
      {subtitle && (
        <DeltaIndicator trend={trend} subtitle={subtitle} />
      )}
    </motion.div>
  );
};

export default StatsCard;