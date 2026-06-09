import { useState, useMemo } from "react";
import { useQuery }          from "@tanstack/react-query";
import {
  Zap,
  AlertTriangle,
  CalendarDays,
  Filter,
  ChevronDown,
  ChevronUp,
  Search,
} from "lucide-react";
import DashboardLayout   from "../../layouts/DashboardLayout";
import Loader            from "../../components/shared/Loader";
import EmptyState        from "../../components/shared/EmptyState";
import { getReports }    from "../../services/reportService";

// ── Helpers ───────────────────────────────────────────────
const getRelativeTime = (date) => {
  const diff = Math.floor((Date.now() - new Date(date)) / 1000);
  if (diff < 3600)   return `${Math.floor(diff / 60)}m ago`;
  if (diff < 86400)  return `${Math.floor(diff / 3600)}h ago`;
  if (diff < 604800) return `${Math.floor(diff / 86400)}d ago`;
  return new Date(date).toLocaleDateString("en-US", {
    month: "short", day: "numeric",
  });
};

const getDateGroup = (date) => {
  const d         = new Date(date);
  const today     = new Date();
  const yesterday = new Date(today);
  yesterday.setDate(today.getDate() - 1);
  if (d.toDateString() === today.toDateString())     return "Today";
  if (d.toDateString() === yesterday.toDateString()) return "Yesterday";
  return d.toLocaleDateString("en-US", {
    weekday: "long", month: "long", day: "numeric",
  });
};

const getInitials = (name) =>
  name
    ? name.split(" ").map((n) => n[0]).join("").slice(0, 2).toUpperCase()
    : "??";

// ── Section block inside a report ─────────────────────────
const ReportSection = ({ icon: Icon, label, content, color, bg }) => {
  if (!content?.trim()) return null;
  return (
    <div className="space-y-2">
      <div className="flex items-center gap-2">
        <div className={`
          w-5 h-5 rounded-md flex-shrink-0
          flex items-center justify-center
          ${bg}
        `}>
          <Icon size={11} className={color} />
        </div>
        <p className="text-[11px] font-semibold text-white/40 uppercase tracking-widest">
          {label}
        </p>
      </div>
      <p className="text-[13px] text-white/65 leading-relaxed pl-7">
        {content}
      </p>
    </div>
  );
};

// ── Date group header ─────────────────────────────────────
const DateGroupHeader = ({ label, count }) => (
  <div className="flex items-center gap-3 mb-4">
    <span className="text-[11px] font-semibold text-white/30 uppercase tracking-widest whitespace-nowrap">
      {label}
    </span>
    <div className="flex-1 h-px bg-white/[0.05]" />
    <span className="text-[10px] text-white/20 tabular-nums whitespace-nowrap">
      {count} {count === 1 ? "report" : "reports"}
    </span>
  </div>
);

// ── Single report card ────────────────────────────────────
const ReportCard = ({ report }) => {
  const [expanded, setExpanded] = useState(false);
  const name = report.employeeId?.fullName ?? "Unknown";

  return (
    <div className="
      bg-[#1A1A24] border border-white/[0.07]
      rounded-xl overflow-hidden
      hover:border-white/[0.12]
      transition-colors duration-150
    ">
      {/* ── Card header ── */}
      <button
        onClick={() => setExpanded((v) => !v)}
        className="
          w-full flex items-center gap-3
          px-5 py-4 text-left
          hover:bg-white/[0.02]
          transition-colors duration-150
        "
      >
        {/* Avatar */}
        <div className="
          w-8 h-8 rounded-full flex-shrink-0
          bg-[#5B73FF]/20 text-[#5B73FF]
          flex items-center justify-center
          text-[11px] font-bold
        ">
          {getInitials(name)}
        </div>

        {/* Name + date */}
        <div className="flex-1 min-w-0">
          <p className="text-[13px] font-semibold text-white/85 leading-none truncate">
            {name}
          </p>
          <p className="text-[11px] text-white/30 mt-0.5 leading-none flex items-center gap-1">
            <CalendarDays size={10} />
            {report.date
              ? new Date(report.date).toLocaleDateString("en-US", {
                  weekday: "short", month: "short", day: "numeric",
                })
              : "—"
            }
          </p>
        </div>

        {/* Right: time + chevron */}
        <div className="flex items-center gap-3 flex-shrink-0">
          <span className="
            hidden sm:block
            text-[11px] text-white/25 tabular-nums
          ">
            {getRelativeTime(report.createdAt ?? report.date)}
          </span>

          {/* Preview snippet when collapsed */}
          {!expanded && report.workDone && (
            <span className="
              hidden md:block
              text-[11px] text-white/30
              max-w-[200px] truncate
            ">
              {report.workDone.slice(0, 60)}…
            </span>
          )}

          <div className={`
            w-6 h-6 rounded-md flex items-center justify-center
            bg-white/[0.04] text-white/30
            transition-colors duration-150
          `}>
            {expanded
              ? <ChevronUp   size={13} />
              : <ChevronDown size={13} />
            }
          </div>
        </div>
      </button>

      {/* ── Expanded content ── */}
      {expanded && (
        <div className="
          px-5 pb-5 pt-1
          border-t border-white/[0.05]
          space-y-5
        ">
          {/* Work Done */}
          <ReportSection
            icon={Zap}
            label="Work Done Today"
            content={report.workDone}
            color="text-[#5B73FF]"
            bg="bg-[#5B73FF]/10"
          />

          {/* Blockers */}
          <ReportSection
            icon={AlertTriangle}
            label="Blockers / Challenges"
            content={report.blockers}
            color="text-[#F59E0B]"
            bg="bg-[#F59E0B]/10"
          />

          {/* Tomorrow's Plan */}
          <ReportSection
            icon={CalendarDays}
            label="Tomorrow's Plan"
            content={report.tomorrowPlan}
            color="text-[#22C97B]"
            bg="bg-[#22C97B]/10"
          />
        </div>
      )}
    </div>
  );
};

// ── Filter tab ────────────────────────────────────────────
const FilterTab = ({ active, onClick, children }) => (
  <button
    onClick={onClick}
    className={`
      px-3 py-1.5 rounded-lg text-[12px] font-medium
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

// ── DailyReportsPage ──────────────────────────────────────
const FILTERS = [
  { key: "ALL",       label: "All"       },
  { key: "TODAY",     label: "Today"     },
  { key: "YESTERDAY", label: "Yesterday" },
  { key: "WEEK",      label: "This Week" },
];

const DailyReportsPage = () => {
  const [filter, setFilter]   = useState("ALL");
  const [search, setSearch]   = useState("");

  const { data, isLoading } = useQuery({
    queryKey: ["reports"],
    queryFn:  getReports,
  });

  const reports = data?.data ?? [];

  // ── Search + filter ──
  const filtered = useMemo(() => {
    const now       = new Date();
    const today     = new Date(now.getFullYear(), now.getMonth(), now.getDate());
    const yesterday = new Date(today);
    yesterday.setDate(today.getDate() - 1);
    const weekAgo   = new Date(today);
    weekAgo.setDate(today.getDate() - 7);

    return reports.filter((r) => {
      const d = new Date(r.date ?? r.createdAt);

      const passesFilter =
        filter === "ALL"       ? true :
        filter === "TODAY"     ? d >= today :
        filter === "YESTERDAY" ? d >= yesterday && d < today :
        filter === "WEEK"      ? d >= weekAgo :
        true;

      const passesSearch = !search.trim() ||
        r.employeeId?.fullName?.toLowerCase().includes(search.toLowerCase()) ||
        r.workDone?.toLowerCase().includes(search.toLowerCase());

      return passesFilter && passesSearch;
    });
  }, [reports, filter, search]);

  // ── Group by date ──
  const grouped = useMemo(() =>
    filtered.reduce((acc, r) => {
      const group = getDateGroup(r.date ?? r.createdAt);
      if (!acc[group]) acc[group] = [];
      acc[group].push(r);
      return acc;
    }, {}),
  [filtered]);

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
            Reports
          </p>
          <h1 className="text-[22px] font-semibold text-white/90 leading-tight">
            Daily Reports
          </h1>
          <p className="text-[13px] text-white/35 mt-1">
            End-of-day summaries submitted by your team.
          </p>
        </div>

        {/* Total count pill */}
        <div className="
          hidden sm:flex flex-col items-end gap-1
          px-4 py-3 rounded-xl
          bg-[#1A1A24] border border-white/[0.07]
        ">
          <p className="text-[11px] text-white/30 font-medium uppercase tracking-widest">
            Total
          </p>
          <p className="text-[22px] font-semibold text-white/90 tabular-nums leading-none">
            {reports.length}
          </p>
        </div>
      </div>

      {/* ── Filter + search bar ── */}
      <div className="
        flex flex-wrap items-center gap-2
        mb-6 pb-5 border-b border-white/[0.05]
      ">
        <Filter size={13} className="text-white/25 flex-shrink-0" />

        {FILTERS.map((f) => (
          <FilterTab
            key={f.key}
            active={filter === f.key}
            onClick={() => setFilter(f.key)}
          >
            {f.label}
          </FilterTab>
        ))}

        {/* Search input */}
        <div className="relative ml-auto">
          <Search
            size={13}
            className="absolute left-3 top-1/2 -translate-y-1/2 text-white/25 pointer-events-none"
          />
          <input
            type="text"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Search reports..."
            className="
              h-8 pl-8 pr-3 w-48
              bg-[#111118] border border-white/[0.07]
              rounded-lg
              text-[12px] text-white/70
              placeholder:text-white/20
              outline-none
              focus:border-[#5B73FF]/50
              focus:ring-2 focus:ring-[#5B73FF]/10
              transition-all duration-150
            "
          />
        </div>

        <span className="text-[11px] text-white/20 tabular-nums whitespace-nowrap">
          {filtered.length} {filtered.length === 1 ? "report" : "reports"}
        </span>
      </div>

      {/* ── Content ── */}
      {filtered.length === 0 ? (
        <EmptyState
          preset={reports.length === 0 ? "reports" : "search"}
          title={reports.length === 0
            ? "No reports yet"
            : "No reports match your search"
          }
          description={reports.length === 0
            ? "Daily reports submitted by your team will appear here."
            : "Try adjusting your search or filter."
          }
          secondary={
            (filter !== "ALL" || search)
              ? {
                  label: "Clear filters",
                  onClick: () => { setFilter("ALL"); setSearch(""); },
                }
              : undefined
          }
        />
      ) : (
        <div className="space-y-8">
          {Object.entries(grouped).map(([dateLabel, items]) => (
            <div key={dateLabel}>
              <DateGroupHeader label={dateLabel} count={items.length} />
              <div className="space-y-3">
                {items.map((report) => (
                  <ReportCard key={report._id} report={report} />
                ))}
              </div>
            </div>
          ))}
        </div>
      )}

    </DashboardLayout>
  );
};

export default DailyReportsPage;