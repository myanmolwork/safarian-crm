import { motion } from "framer-motion";

// ── Spinner ───────────────────────────────────────────────
const SpinnerRing = ({ size, color }) => (
  <svg
    width={size}
    height={size}
    viewBox="0 0 24 24"
    fill="none"
    className="animate-spin"
    style={{ animationDuration: "0.7s" }}
  >
    <circle
      cx="12" cy="12" r="9"
      stroke="currentColor"
      strokeWidth="2"
      className="text-white/[0.06]"
    />
    <path
      d="M12 3a9 9 0 0 1 9 9"
      stroke={color}
      strokeWidth="2"
      strokeLinecap="round"
    />
  </svg>
);

// ── Skeleton primitives ───────────────────────────────────
const SkeletonLine = ({ width = "100%", height = 10, delay = 0 }) => (
  <motion.div
    animate={{ opacity: [0.4, 0.8, 0.4] }}
    transition={{ duration: 1.6, repeat: Infinity, ease: "easeInOut", delay }}
    className="rounded-md bg-white/[0.06]"
    style={{ width, height }}
  />
);

const SkeletonAvatar = ({ size = 32 }) => (
  <motion.div
    animate={{ opacity: [0.4, 0.8, 0.4] }}
    transition={{ duration: 1.6, repeat: Infinity, ease: "easeInOut" }}
    className="rounded-full bg-white/[0.06] flex-shrink-0"
    style={{ width: size, height: size }}
  />
);

// ── Skeleton presets ──────────────────────────────────────
const SkeletonCard = () => (
  <div className="bg-[#1A1A24] border border-white/[0.07] rounded-xl p-5 space-y-3">
    <div className="flex items-center gap-3">
      <SkeletonAvatar size={36} />
      <div className="flex-1 space-y-2">
        <SkeletonLine width="55%" height={11} />
        <SkeletonLine width="35%" height={9}  delay={0.1} />
      </div>
    </div>
    <SkeletonLine width="100%" height={9}  delay={0.05} />
    <SkeletonLine width="80%"  height={9}  delay={0.10} />
    <SkeletonLine width="60%"  height={9}  delay={0.15} />
  </div>
);

const SkeletonRow = () => (
  <div className="flex items-center gap-4 px-5 py-3.5 border-b border-white/[0.04] last:border-0">
    <SkeletonAvatar size={28} />
    <SkeletonLine width="18%" height={10} />
    <SkeletonLine width="12%" height={10} delay={0.05} />
    <SkeletonLine width="14%" height={10} delay={0.10} />
    <div className="ml-auto">
      <SkeletonLine width={56} height={22} delay={0.15} />
    </div>
  </div>
);

const SkeletonKanbanCard = () => (
  <div className="bg-[#1A1A24] border border-white/[0.07] rounded-xl p-4 space-y-3">
    <div className="flex items-center gap-2">
      <SkeletonLine width={40} height={8} />
    </div>
    <SkeletonLine width="85%" height={11} />
    <SkeletonLine width="60%" height={9}  delay={0.08} />
    <div className="flex items-center justify-between pt-1">
      <SkeletonAvatar size={20} />
      <SkeletonLine width={52} height={8} delay={0.12} />
    </div>
  </div>
);

const SkeletonStatCard = () => (
  <div className="bg-[#1A1A24] border border-white/[0.07] rounded-xl p-5 space-y-3">
    <div className="flex items-center justify-between">
      <SkeletonLine width="45%" height={10} />
      <SkeletonLine width={28}  height={28} />
    </div>
    <SkeletonLine width="40%" height={28} delay={0.08} />
    <SkeletonLine width={88}   height={20} delay={0.12} />
  </div>
);

// ── SkeletonGrid — FIXED ──────────────────────────────────
// Previously used `children` as a component reference which is
// not valid React. Now accepts a `component` prop instead.
const SkeletonGrid = ({ count = 4, component: Card = SkeletonCard }) =>
  Array.from({ length: count }).map((_, i) => <Card key={i} />);

// ── Page loader ───────────────────────────────────────────
const PageLoader = () => (
  <div className="
    fixed inset-0 z-50
    flex flex-col items-center justify-center gap-4
    bg-[#0A0A0F]
  ">
    <div className="flex items-center gap-3 mb-2">
      <div className="w-7 h-7 rounded-lg bg-[#5B73FF] flex items-center justify-center">
        <span className="text-white text-[13px] font-bold">S</span>
      </div>
      <span className="text-[15px] font-semibold text-white/60">Safarian CRM</span>
    </div>
    <SpinnerRing size={28} color="#5B73FF" />
    <p className="text-[12px] text-white/25">Loading your workspace…</p>
  </div>
);

// ── Section loader ────────────────────────────────────────
const SectionLoader = ({ label = "Loading…" }) => (
  <div className="flex flex-col items-center justify-center py-14 gap-3">
    <SpinnerRing size={24} color="#5B73FF" />
    <p className="text-[12px] text-white/25">{label}</p>
  </div>
);

// ── Button spinner ────────────────────────────────────────
const ButtonSpinner = ({ size = 14, color = "#fff" }) => (
  <SpinnerRing size={size} color={color} />
);

// ── Loader (default export) ───────────────────────────────
const Loader = ({
  variant = "section",
  count   = 4,
  label,
}) => {
  if (variant === "page")    return <PageLoader />;
  if (variant === "section") return <SectionLoader label={label} />;

  if (variant === "card")
    return (
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
        {Array.from({ length: count }).map((_, i) => (
          <SkeletonCard key={i} />
        ))}
      </div>
    );

  if (variant === "stats")
    return (
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        {Array.from({ length: count }).map((_, i) => (
          <SkeletonStatCard key={i} />
        ))}
      </div>
    );

  if (variant === "table")
    return (
      <div className="bg-[#1A1A24] border border-white/[0.07] rounded-2xl overflow-hidden">
        {Array.from({ length: count }).map((_, i) => (
          <SkeletonRow key={i} />
        ))}
      </div>
    );

  if (variant === "kanban")
    return (
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        {Array.from({ length: 3 }).map((_, col) => (
          <div
            key={col}
            className="bg-[#111118] border border-white/[0.06] rounded-xl p-3 space-y-2.5"
          >
            <SkeletonLine width="50%" height={11} />
            {Array.from({ length: count }).map((_, i) => (
              <SkeletonKanbanCard key={i} />
            ))}
          </div>
        ))}
      </div>
    );

  return <SectionLoader label={label} />;
};

export {
  ButtonSpinner,
  SectionLoader,
  PageLoader,
  SkeletonCard,
  SkeletonRow,
  SkeletonStatCard,
  SkeletonKanbanCard,
  SkeletonGrid,      // ✅ now correctly exported with fixed API
  SkeletonLine,      // ✅ exported for custom skeleton composition
  SkeletonAvatar,    // ✅ exported for custom skeleton composition
};
export default Loader;