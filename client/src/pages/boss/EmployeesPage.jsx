import { useState, useMemo } from "react";
import { useQuery }          from "@tanstack/react-query";
import {
  UserPlus,
  Search,
  Filter,
  Users,
  Briefcase,
  Shield,
} from "lucide-react";
import DashboardLayout        from "../../layouts/DashboardLayout";
import Loader                 from "../../components/shared/Loader";
import EmptyState             from "../../components/shared/EmptyState";
import CreateEmployeeModal    from "../../components/dashboard/CreateEmployeeModal";
import RoleBadge              from "../../components/shared/RoleBadge";
import StatsCard              from "../../components/dashboard/StatsCard";
import { getUsers }           from "../../services/userService";

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

// ── Employee card ─────────────────────────────────────────
const EmployeeCard = ({ user }) => {
  const initials = user.fullName
    ? user.fullName.split(" ").map((n) => n[0]).join("").slice(0, 2).toUpperCase()
    : "??";

  // Avatar accent per role
  const avatarStyle = {
    BOSS:        "bg-[#F59E0B]/20 text-[#F59E0B]",
    TEAM_LEADER: "bg-[#A78BFA]/20 text-[#A78BFA]",
    WORKER:      "bg-[#5B73FF]/20 text-[#5B73FF]",
  }[user.role] ?? "bg-white/[0.06] text-white/40";

  return (
    <div className="
      group
      bg-[#1A1A24] border border-white/[0.07]
      rounded-xl p-4
      hover:border-white/[0.14]
      transition-colors duration-150
    ">
      <div className="flex items-center gap-3">
        {/* Avatar */}
        <div className={`
          relative w-10 h-10 rounded-full flex-shrink-0
          flex items-center justify-center
          text-[13px] font-bold
          ${avatarStyle}
        `}>
          {initials}
          {/* Online dot */}
          <span className="
            absolute bottom-0 right-0
            w-2.5 h-2.5 rounded-full
            bg-[#22C97B]
            border-2 border-[#1A1A24]
          " />
        </div>

        {/* Info */}
        <div className="flex-1 min-w-0">
          <p className="text-[13px] font-semibold text-white/85 leading-none truncate">
            {user.fullName}
          </p>
          <p className="text-[11px] text-white/35 mt-0.5 leading-none truncate">
            {user.email}
          </p>
        </div>

        {/* Role badge */}
        <RoleBadge role={user.role} />
      </div>

      {/* ── Stats row ── */}
      <div className="
        grid grid-cols-3 gap-2
        mt-4 pt-3
        border-t border-white/[0.05]
      ">
        {[
          { label: "Team",     value: user.team?.teamName ?? "—"  },
          { label: "Tasks",    value: user.taskCount      ?? "—"  },
          { label: "Joined",   value: user.createdAt
              ? new Date(user.createdAt).toLocaleDateString("en-US", { month: "short", year: "numeric" })
              : "—"
          },
        ].map(({ label, value }) => (
          <div key={label} className="flex flex-col gap-0.5">
            <span className="text-[10px] font-semibold text-white/25 uppercase tracking-wider">
              {label}
            </span>
            <span className="text-[12px] font-medium text-white/60 truncate">
              {value}
            </span>
          </div>
        ))}
      </div>
    </div>
  );
};

// ── EmployeesPage ─────────────────────────────────────────
const ROLE_FILTERS = [
  { key: "ALL",         label: "All"          },
  { key: "WORKER",      label: "Workers"      },
  { key: "TEAM_LEADER", label: "Team Leaders" },
  { key: "BOSS",        label: "Boss"         },
];

const EmployeesPage = () => {
  const [showModal,    setShowModal]    = useState(false);
  const [roleFilter,   setRoleFilter]   = useState("ALL");
  const [search,       setSearch]       = useState("");

  const { data, isLoading, refetch } = useQuery({
    queryKey: ["users"],
    queryFn:  getUsers,
  });

  const users = data?.data ?? [];

  // ── Derived counts ──
  const total   = users.length;
  const workers = users.filter((u) => u.role === "WORKER").length;
  const leaders = users.filter((u) => u.role === "TEAM_LEADER").length;

  // ── Search + filter ──
  const filtered = useMemo(() =>
    users.filter((u) => {
      const passesRole   = roleFilter === "ALL" || u.role === roleFilter;
      const passesSearch = !search.trim() ||
        u.fullName?.toLowerCase().includes(search.toLowerCase()) ||
        u.email?.toLowerCase().includes(search.toLowerCase());
      return passesRole && passesSearch;
    }),
  [users, roleFilter, search]);

  // ── Loading ──
  if (isLoading) {
    return (
      <DashboardLayout>
        <div className="mb-8 space-y-2">
          <div className="h-6 w-36 rounded-lg bg-white/[0.06] animate-pulse" />
          <div className="h-4 w-48 rounded-lg bg-white/[0.04] animate-pulse" />
        </div>
        <Loader variant="stats" count={3} />
        <div className="mt-6">
          <Loader variant="card"  count={6} />
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
            Employees
          </h1>
          <p className="text-[13px] text-white/35 mt-1">
            Manage your organization's workforce.
          </p>
        </div>

        {/* Add employee button */}
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
          <UserPlus size={14} />
          Add Employee
        </button>
      </div>

      {/* ── KPI strip ── */}
      <div className="grid grid-cols-3 gap-4 mb-6">
        <StatsCard
          title="Total"
          value={total}
          subtitle="All employees"
          trend="neutral"
          icon={Users}
          accent="bg-[#5B73FF]/15"
          accentText="text-[#5B73FF]"
        />
        <StatsCard
          title="Team Leaders"
          value={leaders}
          subtitle="Managing teams"
          trend="neutral"
          icon={Briefcase}
          accent="bg-[#A78BFA]/15"
          accentText="text-[#A78BFA]"
        />
        <StatsCard
          title="Workers"
          value={workers}
          subtitle="Active members"
          trend="neutral"
          icon={Shield}
          accent="bg-[#22C97B]/15"
          accentText="text-[#22C97B]"
        />
      </div>

      {/* ── Filter + search bar ── */}
      <div className="
        flex flex-wrap items-center gap-2
        mb-6 pb-5 border-b border-white/[0.05]
      ">
        <Filter size={13} className="text-white/25 flex-shrink-0" />

        {ROLE_FILTERS.map((f) => (
          <FilterTab
            key={f.key}
            active={roleFilter === f.key}
            onClick={() => setRoleFilter(f.key)}
          >
            {f.label}
          </FilterTab>
        ))}

        {/* Search */}
        <div className="relative ml-auto">
          <Search
            size={13}
            className="absolute left-3 top-1/2 -translate-y-1/2 text-white/25 pointer-events-none"
          />
          <input
            type="text"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Search employees..."
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
          {filtered.length} {filtered.length === 1 ? "employee" : "employees"}
        </span>
      </div>

      {/* ── Employee grid or empty ── */}
      {filtered.length === 0 ? (
        <EmptyState
          preset={users.length === 0 ? "employees" : "search"}
          title={users.length === 0
            ? "No employees yet"
            : "No employees match your search"
          }
          description={users.length === 0
            ? "Add your first team member to get started."
            : "Try adjusting your search or role filter."
          }
          action={users.length === 0
            ? { label: "Add Employee", onClick: () => setShowModal(true) }
            : undefined
          }
          secondary={
            (roleFilter !== "ALL" || search)
              ? { label: "Clear filters", onClick: () => { setRoleFilter("ALL"); setSearch(""); } }
              : undefined
          }
        />
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-3 gap-4">
          {filtered.map((user) => (
            <EmployeeCard key={user._id} user={user} />
          ))}
        </div>
      )}

      {/* ── Modal ── */}
      {showModal && (
        <CreateEmployeeModal
          onClose={() => setShowModal(false)}
          refetch={refetch}
        />
      )}

    </DashboardLayout>
  );
};

export default EmployeesPage;