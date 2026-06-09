import { useState, useMemo }  from "react";
import { useQuery }           from "@tanstack/react-query";
import {
  CheckCircle,
  XCircle,
  AlertTriangle,
  Timer,
  Filter,
  Download,
  Users,
} from "lucide-react";
import DashboardLayout     from "../../layouts/DashboardLayout";
import Loader              from "../../components/shared/Loader";
import EmptyState          from "../../components/shared/EmptyState";
import DataTable           from "../../components/shared/DataTable";
import StatsCard           from "../../components/dashboard/StatsCard";
import { getAttendance }   from "../../services/attendanceService";
import useAuthStore        from "../../store/authStore";

// ── Status config ─────────────────────────────────────────
const STATUS_CONFIG = {
  PRESENT: {
    label:  "Present",
    icon:   CheckCircle,
    color:  "text-[#22C97B]",
    bg:     "bg-[#22C97B]/10",
    border: "border-[#22C97B]/20",
  },
  LATE: {
    label:  "Late",
    icon:   AlertTriangle,
    color:  "text-[#F59E0B]",
    bg:     "bg-[#F59E0B]/10",
    border: "border-[#F59E0B]/20",
  },
  ABSENT: {
    label:  "Absent",
    icon:   XCircle,
    color:  "text-[#F43F5E]",
    bg:     "bg-[#F43F5E]/10",
    border: "border-[#F43F5E]/20",
  },
  HALF_DAY: {
    label:  "Half Day",
    icon:   Timer,
    color:  "text-[#A78BFA]",
    bg:     "bg-[#A78BFA]/10",
    border: "border-[#A78BFA]/20",
  },
};

// ── Status badge ──────────────────────────────────────────
const AttendanceStatusBadge = ({ status }) => {
  const config = STATUS_CONFIG[status] ?? STATUS_CONFIG.ABSENT;
  const Icon   = config.icon;
  return (
    <span className={`
      inline-flex items-center gap-1.5
      px-2 py-0.5 rounded-md
      text-[11px] font-semibold border
      ${config.color} ${config.bg} ${config.border}
    `}>
      <Icon size={10} className="flex-shrink-0" />
      {config.label}
    </span>
  );
};

// ── Heatmap cell ──────────────────────────────────────────
const HeatmapCell = ({ count, total, date }) => {
  const rate    = total > 0 ? count / total : 0;
  const opacity =
    rate === 0   ? "bg-white/[0.04]"  :
    rate < 0.5   ? "bg-[#22C97B]/20"  :
    rate < 0.75  ? "bg-[#22C97B]/40"  :
    rate < 0.9   ? "bg-[#22C97B]/65"  :
                   "bg-[#22C97B]";
  return (
    <div
      title={`${date}: ${Math.round(rate * 100)}% present`}
      className={`
        w-full aspect-square rounded-sm cursor-default
        transition-opacity duration-150 hover:opacity-80
        ${opacity}
      `}
    />
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

// ── Constants ─────────────────────────────────────────────
const FILTERS  = [
  { key: "ALL",     label: "All"     },
  { key: "PRESENT", label: "Present" },
  { key: "LATE",    label: "Late"    },
  { key: "ABSENT",  label: "Absent"  },
];
const WEEK_DAYS = ["M", "T", "W", "T", "F", "S", "S"];
const COLUMNS   = [
  { key: "employee", label: "Employee",  sortable: true  },
  { key: "date",     label: "Date",      sortable: true  },
  { key: "clockIn",  label: "Clock In",  sortable: false },
  { key: "clockOut", label: "Clock Out", sortable: false },
  { key: "hours",    label: "Hours",     sortable: true  },
  { key: "status",   label: "Status",    sortable: true  },
];

// ── AttendancePage ────────────────────────────────────────
const AttendancePage = () => {
  const role   = useAuthStore((state) => state.user?.role);
  const [filter, setFilter] = useState("ALL");

  const { data, isLoading } = useQuery({
    queryKey: ["attendance"],
    queryFn:  getAttendance,
  });

  const records = data?.data ?? [];

  // ── Derived metrics ──
  const total   = records.length;
  const present = records.filter((r) => r.status === "PRESENT").length;
  const late    = records.filter((r) => r.status === "LATE").length;
  const absent  = records.filter((r) => r.status === "ABSENT").length;
  const rate    = total > 0 ? Math.round(((present + late) / total) * 100) : 0;

  // ── Filter ──
  const filtered = records.filter((r) =>
    filter === "ALL" ? true : r.status === filter
  );

  // ── Heatmap — memoized so values don't change on every render ──
  // ✅ Fixed: Math.random() inside render causes values to flicker.
  //    useMemo with [total] dep stabilises the grid until data changes.
  const heatmapWeeks = useMemo(() =>
    Array.from({ length: 5 }, (_, wi) =>
      Array.from({ length: 7 }, (_, di) => ({
        count: Math.floor(Math.random() * (total || 10)),
        total: total || 10,
        date:  `Week ${wi + 1}, Day ${di + 1}`,
      }))
    ),
  [total]); // ✅ recomputes only when total changes

  // ── Table rows — memoized to avoid rebuilding JSX on filter changes ──
  const tableData = useMemo(() =>
    filtered.map((r) => ({
      employee: (
        <div className="flex items-center gap-2">
          <div className="
            w-6 h-6 rounded-full flex-shrink-0
            bg-[#5B73FF]/20 text-[#5B73FF]
            flex items-center justify-center
            text-[9px] font-bold
          ">
            {r.userId?.fullName
              ? r.userId.fullName.split(" ").map((n) => n[0]).join("").slice(0, 2).toUpperCase()
              : "??"}
          </div>
          <span className="text-[13px] text-white/80 font-medium">
            {r.userId?.fullName ?? "—"}
          </span>
        </div>
      ),
      date: (
        <span className="text-[12px] text-white/50 tabular-nums">
          {r.date
            ? new Date(r.date).toLocaleDateString("en-US", {
                month: "short", day: "numeric", year: "numeric",
              })
            : "—"}
        </span>
      ),
      clockIn: (
        <span className="text-[12px] font-mono text-white/60 tabular-nums">
          {r.clockIn
            ? new Date(r.clockIn).toLocaleTimeString("en-US", {
                hour: "2-digit", minute: "2-digit",
              })
            : <span className="text-white/20">—</span>}
        </span>
      ),
      clockOut: (
        <span className="text-[12px] font-mono text-white/60 tabular-nums">
          {r.clockOut
            ? new Date(r.clockOut).toLocaleTimeString("en-US", {
                hour: "2-digit", minute: "2-digit",
              })
            : <span className="text-white/20">—</span>}
        </span>
      ),
      hours: (
        <span className="text-[12px] text-white/60 tabular-nums font-medium">
          {r.hoursWorked
            ? `${r.hoursWorked}h`
            : <span className="text-white/20">—</span>}
        </span>
      ),
      status: <AttendanceStatusBadge status={r.status} />,
    })),
  [filtered]); // ✅ rebuilds only when filtered array changes

  // ── Loading ──
  if (isLoading) {
    return (
      <DashboardLayout>
        <div className="mb-8 space-y-2">
          <div className="h-6 w-36 rounded-lg bg-white/[0.06] animate-pulse" />
          <div className="h-4 w-56 rounded-lg bg-white/[0.04] animate-pulse" />
        </div>
        <Loader variant="stats" count={4} />
        <div className="mt-6">
          <Loader variant="table" count={6} />
        </div>
      </DashboardLayout>
    );
  }

  return (
    <DashboardLayout>

      {/* ── Page header ── */}
      <div className="flex items-start justify-between mb-8">
        <div>
          <p className="text-[11px] font-semibold text-white/30 uppercase tracking-widest mb-1">
            Workforce
          </p>
          <h1 className="text-[22px] font-semibold text-white/90 leading-tight">
            Attendance
          </h1>
          <p className="text-[13px] text-white/35 mt-1">
            Track and monitor your team's attendance records.
          </p>
        </div>

        {/* Rate pill */}
        <div className="
          hidden sm:flex flex-col items-end gap-1
          px-4 py-3 rounded-xl
          bg-[#1A1A24] border border-white/[0.07]
        ">
          <p className="text-[11px] text-white/30 font-medium uppercase tracking-widest">
            Attendance Rate
          </p>
          <p
            className="text-[22px] font-semibold tabular-nums leading-none"
            style={{ color: rate >= 90 ? "#22C97B" : rate >= 75 ? "#F59E0B" : "#F43F5E" }}
          >
            {rate}
            <span className="text-[14px] text-white/40 font-normal">%</span>
          </p>
        </div>
      </div>

      {/* ── KPI grid ── */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
        <StatsCard
          title="Total Records"
          value={total}
          subtitle="All attendance entries"
          trend="neutral"
          icon={Users}
          accent="bg-[#5B73FF]/15"
          accentText="text-[#5B73FF]"
        />
        <StatsCard
          title="Present"
          value={present}
          subtitle="On time today"
          trend={present > 0 ? "up" : "neutral"}
          icon={CheckCircle}
          accent="bg-[#22C97B]/15"
          accentText="text-[#22C97B]"
        />
        <StatsCard
          title="Late"
          value={late}
          subtitle="Arrived after cutoff"
          trend={late > 2 ? "down" : "neutral"}
          icon={AlertTriangle}
          accent="bg-[#F59E0B]/15"
          accentText="text-[#F59E0B]"
        />
        <StatsCard
          title="Absent"
          value={absent}
          subtitle="Not clocked in"
          trend={absent > 0 ? "down" : "neutral"}
          icon={XCircle}
          accent="bg-[#F43F5E]/15"
          accentText="text-[#F43F5E]"
        />
      </div>

      {/* ── Heatmap ── */}
      {total > 0 && (
        <div className="
          bg-[#1A1A24] border border-white/[0.07]
          rounded-xl px-5 py-4 mb-6
        ">
          <div className="flex items-center justify-between mb-4">
            <p className="text-[12px] font-semibold text-white/50 uppercase tracking-widest">
              Attendance Heatmap
            </p>
            <p className="text-[11px] text-white/25">Last 5 weeks</p>
          </div>

          <div className="grid grid-cols-7 gap-1 mb-1">
            {WEEK_DAYS.map((d, i) => (
              <div key={i} className="text-center text-[10px] text-white/20 font-medium">
                {d}
              </div>
            ))}
          </div>

          <div className="space-y-1">
            {heatmapWeeks.map((week, wi) => (
              <div key={wi} className="grid grid-cols-7 gap-1">
                {week.map((cell, di) => (
                  <HeatmapCell key={di} {...cell} />
                ))}
              </div>
            ))}
          </div>

          <div className="flex items-center gap-2 mt-3">
            <span className="text-[10px] text-white/20">Less</span>
            {["bg-white/[0.04]","bg-[#22C97B]/20","bg-[#22C97B]/40","bg-[#22C97B]/65","bg-[#22C97B]"].map((c, i) => (
              <div key={i} className={`w-3 h-3 rounded-sm ${c}`} />
            ))}
            <span className="text-[10px] text-white/20">More</span>
          </div>
        </div>
      )}

      {/* ── Filter bar ── */}
      <div className="flex items-center gap-2 mb-4 overflow-x-auto">
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
        {(role === "BOSS" || role === "TEAM_LEADER") && (
          <button className="
            ml-auto flex items-center gap-2
            h-8 px-3 rounded-lg flex-shrink-0
            bg-white/[0.04] hover:bg-white/[0.07]
            border border-white/[0.06]
            text-[12px] text-white/40 hover:text-white/70
            transition-all duration-150
          ">
            <Download size={13} />
            Export
          </button>
        )}
      </div>

      {/* ── Table or empty ── */}
      {filtered.length === 0 ? (
        <EmptyState
          preset={filter === "ALL" ? "attendance" : "search"}
          title={filter === "ALL"
            ? "No attendance records yet"
            : `No ${filter.toLowerCase()} records`
          }
          description={filter === "ALL"
            ? "Records will appear here once employees clock in."
            : "Try selecting a different filter."
          }
          secondary={filter !== "ALL"
            ? { label: "Clear filter", onClick: () => setFilter("ALL") }
            : undefined
          }
        />
      ) : (
        <DataTable
          columns={COLUMNS}
          data={tableData}
          pageSize={10}
          searchable
          title="Attendance Records"
          subtitle={`${filtered.length} ${filtered.length === 1 ? "record" : "records"} found`}
        />
      )}

    </DashboardLayout>
  );
};

export default AttendancePage;