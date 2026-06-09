import { useState }     from "react";
import { useQuery }     from "@tanstack/react-query";
import {
  CheckCircle,
  Clock,
  FileText,
  UserPlus,
  AlertTriangle,
  MessageSquare,
  FolderKanban,
  Activity,
  Filter,
} from "lucide-react";
import DashboardLayout      from "../../layouts/DashboardLayout";
import Loader               from "../../components/shared/Loader";
import EmptyState           from "../../components/shared/EmptyState";
import { getActivities }    from "../../services/activityService";

// ── Activity type config ──────────────────────────────────
const getActivityConfig = (type) => {
  const configs = {
    TASK_COMPLETED:  { icon: CheckCircle,    color: "text-[#22C97B]", bg: "bg-[#22C97B]/12",  border: "border-[#22C97B]/20", label: "Task Completed"  },
    TASK_CREATED:    { icon: FolderKanban,   color: "text-[#5B73FF]", bg: "bg-[#5B73FF]/12",  border: "border-[#5B73FF]/20", label: "Task Created"    },
    TASK_UPDATED:    { icon: FolderKanban,   color: "text-[#5B73FF]", bg: "bg-[#5B73FF]/12",  border: "border-[#5B73FF]/20", label: "Task Updated"    },
    REPORT_SUBMITTED:{ icon: FileText,       color: "text-[#F59E0B]", bg: "bg-[#F59E0B]/12",  border: "border-[#F59E0B]/20", label: "Report Submitted"},
    ATTENDANCE:      { icon: Clock,          color: "text-[#22C97B]", bg: "bg-[#22C97B]/12",  border: "border-[#22C97B]/20", label: "Attendance"      },
    USER_JOINED:     { icon: UserPlus,       color: "text-[#A78BFA]", bg: "bg-[#A78BFA]/12",  border: "border-[#A78BFA]/20", label: "User Joined"     },
    COMMENT:         { icon: MessageSquare,  color: "text-white/40",  bg: "bg-white/[0.06]",  border: "border-white/[0.08]", label: "Comment"         },
    OVERDUE:         { icon: AlertTriangle,  color: "text-[#F43F5E]", bg: "bg-[#F43F5E]/12",  border: "border-[#F43F5E]/20", label: "Task Overdue"    },
  };
  return configs[type] ?? {
    icon:   Activity,
    color:  "text-white/30",
    bg:     "bg-white/[0.04]",
    border: "border-white/[0.06]",
    label:  "Activity",
  };
};

// ── Time helpers ──────────────────────────────────────────
const getRelativeTime = (date) => {
  const diff = Math.floor((Date.now() - new Date(date)) / 1000);
  if (diff < 60)   return "just now";
  if (diff < 3600) return `${Math.floor(diff / 60)}m ago`;
  if (diff < 86400) return `${Math.floor(diff / 3600)}h ago`;
  if (diff < 604800) return `${Math.floor(diff / 86400)}d ago`;
  return new Date(date).toLocaleDateString("en-US", {
    month: "short", day: "numeric",
  });
};

const getDateGroup = (date) => {
  const d     = new Date(date);
  const today = new Date();
  const yesterday = new Date(today);
  yesterday.setDate(today.getDate() - 1);

  if (d.toDateString() === today.toDateString())     return "Today";
  if (d.toDateString() === yesterday.toDateString()) return "Yesterday";
  return d.toLocaleDateString("en-US", {
    weekday: "long", month: "long", day: "numeric",
  });
};

// ── Initials avatar ───────────────────────────────────────
const Avatar = ({ name }) => {
  const initials = name
    ? name.split(" ").map((n) => n[0]).join("").slice(0, 2).toUpperCase()
    : "??";
  return (
    <div className="
      w-6 h-6 rounded-full flex-shrink-0
      bg-[#5B73FF]/20 text-[#5B73FF]
      flex items-center justify-center
      text-[9px] font-bold
    ">
      {initials}
    </div>
  );
};

// ── Single activity item ──────────────────────────────────
const ActivityItem = ({ activity, isLast }) => {
  const config = getActivityConfig(activity.type);
  const Icon   = config.icon;
  const name   = activity.userId?.fullName ?? "System";

  return (
    <div className="relative flex gap-4">
      {/* ── Connector line ── */}
      {!isLast && (
        <div className="
          absolute left-[17px] top-9
          w-px bottom-0
          bg-white/[0.05]
        " />
      )}

      {/* ── Icon node ── */}
      <div className={`
        relative z-10 flex-shrink-0
        w-9 h-9 rounded-xl
        flex items-center justify-center
        border
        ${config.bg}
        ${config.border}
      `}>
        <Icon size={15} className={config.color} />
      </div>

      {/* ── Content card ── */}
      <div className="
        flex-1 min-w-0 pb-5
      ">
        <div className="
          bg-[#1A1A24] border border-white/[0.07]
          rounded-xl px-4 py-3.5
          hover:border-white/[0.12]
          transition-colors duration-150
        ">
          {/* Top row */}
          <div className="flex items-start justify-between gap-3 mb-2">
            <div className="flex items-center gap-2 min-w-0">
              <Avatar name={name} />
              <span className="text-[13px] font-semibold text-white/80 truncate">
                {name}
              </span>
              <span className="
                hidden sm:inline-flex
                text-[10px] font-semibold
                px-2 py-0.5 rounded-md
                border
                ${config.bg} ${config.color} ${config.border}
              ">
                {config.label}
              </span>
            </div>

            {/* Timestamp */}
            <span
              title={new Date(activity.createdAt).toLocaleString()}
              className="
                flex-shrink-0
                text-[11px] text-white/25
                font-medium tabular-nums
              "
            >
              {getRelativeTime(activity.createdAt)}
            </span>
          </div>

          {/* Description */}
          <p className="text-[13px] text-white/55 leading-relaxed pl-8">
            {activity.description}
          </p>
        </div>
      </div>
    </div>
  );
};

// ── Date group header ─────────────────────────────────────
const DateGroupHeader = ({ label }) => (
  <div className="flex items-center gap-3 mb-4">
    <span className="text-[11px] font-semibold text-white/30 uppercase tracking-widest whitespace-nowrap">
      {label}
    </span>
    <div className="flex-1 h-px bg-white/[0.05]" />
  </div>
);

// ── Filter tab ────────────────────────────────────────────
const FilterTab = ({ active, onClick, children }) => (
  <button
    onClick={onClick}
    className={`
      px-3 py-1.5 rounded-lg
      text-[12px] font-medium
      transition-all duration-150 whitespace-nowrap
      ${active
        ? "bg-[#5B73FF]/15 text-[#5B73FF]"
        : "text-white/30 hover:text-white/60 hover:bg-white/[0.05]"
      }
    `}
  >
    {children}
  </button>
);

// ── ActivityTimelinePage ──────────────────────────────────
const FILTERS = [
  { key: "ALL",    label: "All"      },
  { key: "TASK",   label: "Tasks"    },
  { key: "REPORT", label: "Reports"  },
  { key: "ATTENDANCE", label: "Attendance" },
];

const ActivityTimelinePage = () => {
  const [activeFilter, setActiveFilter] = useState("ALL");

  const { data, isLoading } = useQuery({
    queryKey: ["activities"],
    queryFn:  getActivities,
  });

  const activities = data?.data ?? [];

  // ── Filter ──
  const filtered = activities.filter((a) => {
    if (activeFilter === "ALL")        return true;
    if (activeFilter === "TASK")       return a.type?.startsWith("TASK");
    if (activeFilter === "REPORT")     return a.type === "REPORT_SUBMITTED";
    if (activeFilter === "ATTENDANCE") return a.type === "ATTENDANCE";
    return true;
  });

  // ── Group by date ──
  const grouped = filtered.reduce((acc, activity) => {
    const group = getDateGroup(activity.createdAt);
    if (!acc[group]) acc[group] = [];
    acc[group].push(activity);
    return acc;
  }, {});

  // ── Loading ──
  if (isLoading) {
    return (
      <DashboardLayout>
        <div className="mb-8 space-y-2">
          <div className="h-6 w-36 rounded-lg bg-white/[0.06] animate-pulse" />
          <div className="h-4 w-56 rounded-lg bg-white/[0.04] animate-pulse" />
        </div>
        <Loader variant="section" />
      </DashboardLayout>
    );
  }

  return (
    <DashboardLayout>

      {/* ── Page header ── */}
      <div className="flex items-start justify-between mb-8">
        <div>
          <p className="text-[11px] font-semibold text-white/30 uppercase tracking-widest mb-1">
            Timeline
          </p>
          <h1 className="text-[22px] font-semibold text-white/90 leading-tight">
            Activity Feed
          </h1>
          <p className="text-[13px] text-white/35 mt-1">
            A live timeline of all actions across your organization.
          </p>
        </div>

        {/* Total count badge */}
        <div className="
          hidden sm:flex flex-col items-end gap-1
          px-4 py-3 rounded-xl
          bg-[#1A1A24] border border-white/[0.07]
        ">
          <p className="text-[11px] text-white/30 font-medium uppercase tracking-widest">
            Events
          </p>
          <p className="text-[22px] font-semibold text-white/90 tabular-nums leading-none">
            {activities.length}
          </p>
        </div>
      </div>

      {/* ── Filter bar ── */}
      <div className="
        flex items-center gap-2
        mb-6 pb-5
        border-b border-white/[0.05]
        overflow-x-auto
      ">
        <Filter size={13} className="text-white/25 flex-shrink-0" />
        {FILTERS.map((f) => (
          <FilterTab
            key={f.key}
            active={activeFilter === f.key}
            onClick={() => setActiveFilter(f.key)}
          >
            {f.label}
          </FilterTab>
        ))}
        <span className="ml-auto text-[11px] text-white/20 flex-shrink-0 tabular-nums">
          {filtered.length} {filtered.length === 1 ? "event" : "events"}
        </span>
      </div>

      {/* ── Content ── */}
      {filtered.length === 0 ? (
        <EmptyState
          preset={activeFilter === "ALL" ? "activity" : "search"}
          title={activeFilter === "ALL"
            ? "No activity yet"
            : `No ${FILTERS.find(f => f.key === activeFilter)?.label.toLowerCase()} activity`
          }
          description={activeFilter === "ALL"
            ? "Actions taken by your team will appear here in real time."
            : "Try selecting a different filter."
          }
          secondary={activeFilter !== "ALL"
            ? { label: "Clear filter", onClick: () => setActiveFilter("ALL") }
            : undefined
          }
        />
      ) : (
        <div className="space-y-8">
          {Object.entries(grouped).map(([dateLabel, items]) => (
            <div key={dateLabel}>
              <DateGroupHeader label={dateLabel} />
              <div>
                {items.map((activity, idx) => (
                  <ActivityItem
                    key={activity._id}
                    activity={activity}
                    isLast={idx === items.length - 1}
                  />
                ))}
              </div>
            </div>
          ))}
        </div>
      )}

    </DashboardLayout>
  );
};

export default ActivityTimelinePage;