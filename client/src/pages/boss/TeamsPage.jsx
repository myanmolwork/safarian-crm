import { useState, useMemo }  from "react";
import { useQuery }           from "@tanstack/react-query";
import { AnimatePresence }    from "framer-motion";
import {
  Plus,
  Briefcase,
  Search,
  Filter,
} from "lucide-react";
import DashboardLayout     from "../../layouts/DashboardLayout";
import Loader              from "../../components/shared/Loader";
import EmptyState          from "../../components/shared/EmptyState";
import CreateTeamModal     from "../../components/dashboard/CreateTeamModal";
import StatsCard           from "../../components/dashboard/StatsCard";
import { getTeams }        from "../../services/teamService";

// ── Department config ─────────────────────────────────────
const DEPT_CONFIG = {
  CONTENT: {
    label:  "Content",
    color:  "text-[#5B73FF]",
    bg:     "bg-[#5B73FF]/10",
    border: "border-[#5B73FF]/20",
    dot:    "bg-[#5B73FF]",
  },
  MARKETING: {
    label:  "Marketing",
    color:  "text-[#22C97B]",
    bg:     "bg-[#22C97B]/10",
    border: "border-[#22C97B]/20",
    dot:    "bg-[#22C97B]",
  },
  SOCIAL_MEDIA: {
    label:  "Social Media",
    color:  "text-[#A78BFA]",
    bg:     "bg-[#A78BFA]/10",
    border: "border-[#A78BFA]/20",
    dot:    "bg-[#A78BFA]",
  },
  VIDEO_EDITING: {
    label:  "Video Editing",
    color:  "text-[#F59E0B]",
    bg:     "bg-[#F59E0B]/10",
    border: "border-[#F59E0B]/20",
    dot:    "bg-[#F59E0B]",
  },
};

// ── Department badge ──────────────────────────────────────
const DeptBadge = ({ type }) => {
  const config = DEPT_CONFIG[type] ?? {
    label:  type?.replace(/_/g, " ") ?? "Unknown",
    color:  "text-white/40",
    bg:     "bg-white/[0.06]",
    border: "border-white/[0.08]",
    dot:    "bg-white/30",
  };
  return (
    <span className={`
      inline-flex items-center gap-1.5
      px-2 py-0.5 rounded-md
      text-[11px] font-semibold border
      ${config.color} ${config.bg} ${config.border}
    `}>
      <span className={`w-1.5 h-1.5 rounded-full flex-shrink-0 ${config.dot}`} />
      {config.label}
    </span>
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

// ── Team card ─────────────────────────────────────────────
const TeamCard = ({ team }) => {
  const config   = DEPT_CONFIG[team.departmentType];
  const members  = team.members?.length ?? 0;
  const leader   = team.teamLeader?.fullName ?? "Unassigned";
  const initials = team.teamName
    ? team.teamName.slice(0, 2).toUpperCase()
    : "??";

  return (
    <div className={`
      group
      bg-[#1A1A24]
      border-l-2 border border-white/[0.07]
      rounded-xl p-5
      hover:border-white/[0.13]
      transition-colors duration-150
    `}
    style={{ borderLeftColor: config?.dot?.replace("bg-", "").replace("[", "").replace("]", "") ?? "#5B73FF" }}
    >
      {/* ── Header ── */}
      <div className="flex items-start gap-3 mb-4">
        {/* Team avatar */}
        <div className={`
          w-10 h-10 rounded-xl flex-shrink-0
          flex items-center justify-center
          text-[13px] font-bold
          ${config?.bg ?? "bg-white/[0.06]"}
          ${config?.color ?? "text-white/40"}
        `}>
          {initials}
        </div>

        <div className="flex-1 min-w-0">
          <p className="text-[14px] font-semibold text-white/90 leading-none truncate">
            {team.teamName}
          </p>
          <p className="text-[11px] text-white/35 mt-0.5 leading-none truncate">
            Led by {leader}
          </p>
        </div>

        <DeptBadge type={team.departmentType} />
      </div>

      {/* ── Stats row ── */}
      <div className="
        grid grid-cols-3 gap-2
        pt-3 border-t border-white/[0.05]
      ">
        {[
          { label: "Members",  value: members                                                       },
          { label: "Tasks",    value: team.taskCount    ?? "—"                                      },
          { label: "Created",  value: team.createdAt
              ? new Date(team.createdAt).toLocaleDateString("en-US", { month: "short", year: "numeric" })
              : "—"
          },
        ].map(({ label, value }) => (
          <div key={label} className="flex flex-col gap-0.5">
            <span className="text-[10px] font-semibold text-white/25 uppercase tracking-wider">
              {label}
            </span>
            <span className="text-[12px] font-medium text-white/60 truncate tabular-nums">
              {value}
            </span>
          </div>
        ))}
      </div>
    </div>
  );
};

// ── Department filter keys ────────────────────────────────
const DEPT_FILTERS = [
  { key: "ALL",           label: "All"          },
  { key: "CONTENT",       label: "Content"      },
  { key: "MARKETING",     label: "Marketing"    },
  { key: "SOCIAL_MEDIA",  label: "Social Media" },
  { key: "VIDEO_EDITING", label: "Video Editing"},
];

// ── TeamsPage ─────────────────────────────────────────────
const TeamsPage = () => {
  const [showModal,  setShowModal]  = useState(false);
  const [deptFilter, setDeptFilter] = useState("ALL");
  const [search,     setSearch]     = useState("");

  const { data, isLoading, refetch } = useQuery({
    queryKey: ["teams"],
    queryFn:  getTeams,
  });

  const teams = data?.data ?? [];

  // ── Derived counts ──
  const total   = teams.length;
  const deptCounts = Object.keys(DEPT_CONFIG).reduce((acc, key) => {
    acc[key] = teams.filter((t) => t.departmentType === key).length;
    return acc;
  }, {});

  // ── Search + filter ──
  const filtered = useMemo(() =>
    teams.filter((t) => {
      const passesDept   = deptFilter === "ALL" || t.departmentType === deptFilter;
      const passesSearch = !search.trim() ||
        t.teamName?.toLowerCase().includes(search.toLowerCase()) ||
        t.teamLeader?.fullName?.toLowerCase().includes(search.toLowerCase());
      return passesDept && passesSearch;
    }),
  [teams, deptFilter, search]);

  // ── Loading ──
  if (isLoading) {
    return (
      <DashboardLayout>
        <div className="mb-8 space-y-2">
          <div className="h-6 w-32 rounded-lg bg-white/[0.06] animate-pulse" />
          <div className="h-4 w-48 rounded-lg bg-white/[0.04] animate-pulse" />
        </div>
        <Loader variant="stats" count={4} />
        <div className="mt-6">
          <Loader variant="card" count={4} />
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
            Organization
          </p>
          <h1 className="text-[22px] font-semibold text-white/90 leading-tight">
            Teams
          </h1>
          <p className="text-[13px] text-white/35 mt-1">
            Manage your organization's departments and teams.
          </p>
        </div>

        <button
          onClick={() => setShowModal(true)}
          className="
            flex items-center gap-2
            h-9 px-4 rounded-lg
            bg-[#5B73FF] hover:bg-[#4B63EE]
            text-[13px] font-semibold text-white
            transition-colors duration-150
          "
        >
          <Plus size={14} />
          New Team
        </button>
      </div>

      {/* ── KPI strip ── */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
        <StatsCard
          title="Total Teams"
          value={total}
          subtitle="Active departments"
          trend="neutral"
          icon={Briefcase}
          accent="bg-[#5B73FF]/15"
          accentText="text-[#5B73FF]"
        />
        {Object.entries(DEPT_CONFIG).map(([key, cfg]) => (
          <StatsCard
            key={key}
            title={cfg.label}
            value={deptCounts[key] ?? 0}
            subtitle="Teams"
            trend="neutral"
            icon={Briefcase}
            accent={`${cfg.bg}`}
            accentText={cfg.color}
          />
        ))}
      </div>

      {/* ── Filter + search bar ── */}
      <div className="
        flex flex-wrap items-center gap-2
        mb-6 pb-5 border-b border-white/[0.05]
      ">
        <Filter size={13} className="text-white/25 flex-shrink-0" />

        {DEPT_FILTERS.map((f) => (
          <FilterTab
            key={f.key}
            active={deptFilter === f.key}
            onClick={() => setDeptFilter(f.key)}
          >
            {f.label}
          </FilterTab>
        ))}

        <div className="relative ml-auto">
          <Search
            size={13}
            className="absolute left-3 top-1/2 -translate-y-1/2 text-white/25 pointer-events-none"
          />
          <input
            type="text"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Search teams..."
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
          {filtered.length} {filtered.length === 1 ? "team" : "teams"}
        </span>
      </div>

      {/* ── Team grid or empty ── */}
      {filtered.length === 0 ? (
        <EmptyState
          preset={teams.length === 0 ? "teams" : "search"}
          title={teams.length === 0
            ? "No teams yet"
            : "No teams match your search"
          }
          description={teams.length === 0
            ? "Create your first team to start organizing your workforce."
            : "Try adjusting your search or department filter."
          }
          action={teams.length === 0
            ? { label: "Create Team", onClick: () => setShowModal(true) }
            : undefined
          }
          secondary={
            (deptFilter !== "ALL" || search)
              ? { label: "Clear filters", onClick: () => { setDeptFilter("ALL"); setSearch(""); } }
              : undefined
          }
        />
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-3 gap-4">
          {filtered.map((team) => (
            <TeamCard key={team._id} team={team} />
          ))}
        </div>
      )}

      {/* ── Modal ── */}
      <AnimatePresence>
        {showModal && (
          <CreateTeamModal
            onClose={() => setShowModal(false)}
            refetch={refetch}
          />
        )}
      </AnimatePresence>

    </DashboardLayout>
  );
};

export default TeamsPage;