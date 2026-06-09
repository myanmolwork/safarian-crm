import { useQuery }     from "@tanstack/react-query";
import { useNavigate }  from "react-router-dom";
import {
  Users,
  Briefcase,
  FolderKanban,
  CheckSquare,
  Clock,
  TrendingUp,
  ArrowRight,
  Activity,
  FileText,
  ClipboardList,
} from "lucide-react";
import DashboardLayout   from "../../layouts/DashboardLayout";
import StatsCard         from "../../components/dashboard/StatsCard";
import AnalyticsChart    from "../../components/dashboard/AnalyticsChart";
import Loader            from "../../components/shared/Loader";
import { getDashboardStats } from "../../services/dashboardService";
import useAuthStore      from "../../store/authStore";

// ── Greeting helper ───────────────────────────────────────
const getGreeting = () => {
  const h = new Date().getHours();
  if (h < 12) return "morning";
  if (h < 17) return "afternoon";
  return "evening";
};

// ── Quick action button ───────────────────────────────────
const QuickAction = ({ label, icon: Icon, path, color, bg, navigate }) => (
  <button
    onClick={() => navigate(path)}
    className="
      w-full flex items-center gap-3
      px-3 py-2.5 rounded-lg
      hover:bg-white/[0.05]
      transition-colors duration-150
      text-left group
    "
  >
    <div className={`
      w-7 h-7 rounded-lg flex-shrink-0
      flex items-center justify-center
      ${bg}
    `}>
      <Icon size={14} className={color} />
    </div>
    <span className="
      text-[13px] font-medium
      text-white/50 group-hover:text-white/80
      transition-colors
    ">
      {label}
    </span>
    <ArrowRight
      size={12}
      className="ml-auto text-white/15 group-hover:text-white/40 transition-colors"
    />
  </button>
);

// ── BossDashboard ─────────────────────────────────────────
const BossDashboard = () => {
  const navigate = useNavigate();
  const user     = useAuthStore((state) => state.user);

  const { data, isLoading } = useQuery({
    queryKey: ["dashboard"],
    queryFn:  getDashboardStats,
  });

  // ── Loading ──
  if (isLoading) {
    return (
      <DashboardLayout>
        <div className="mb-8 space-y-2">
          <div className="h-6 w-48 rounded-lg bg-white/[0.06] animate-pulse" />
          <div className="h-4 w-64 rounded-lg bg-white/[0.04] animate-pulse" />
        </div>
        <Loader variant="stats" count={5} />
        <div className="mt-6 grid grid-cols-1 lg:grid-cols-3 gap-4">
          <div className="lg:col-span-2 h-80 rounded-xl bg-white/[0.03] animate-pulse" />
          <div className="h-80 rounded-xl bg-white/[0.03] animate-pulse" />
        </div>
      </DashboardLayout>
    );
  }

  const stats = data?.data ?? {
    totalEmployees:  0,
    totalTeams:      0,
    totalTasks:      0,
    completedTasks:  0,
    attendanceToday: 0,
  };

  // ── Derived ──
  const completionRate = stats.totalTasks > 0
    ? Math.round((stats.completedTasks / stats.totalTasks) * 100)
    : 0;

  // ── Chart data — shaped for AnalyticsChart ──
  const chartData = [
    { name: "Mon", tasks: Math.round(stats.completedTasks * 0.12), attendance: Math.round(stats.attendanceToday * 0.90), reports: Math.round(stats.totalEmployees * 0.80) },
    { name: "Tue", tasks: Math.round(stats.completedTasks * 0.18), attendance: Math.round(stats.attendanceToday * 0.94), reports: Math.round(stats.totalEmployees * 0.85) },
    { name: "Wed", tasks: Math.round(stats.completedTasks * 0.15), attendance: Math.round(stats.attendanceToday * 0.88), reports: Math.round(stats.totalEmployees * 0.75) },
    { name: "Thu", tasks: Math.round(stats.completedTasks * 0.22), attendance: Math.round(stats.attendanceToday * 0.96), reports: Math.round(stats.totalEmployees * 0.90) },
    { name: "Fri", tasks: Math.round(stats.completedTasks * 0.20), attendance: Math.round(stats.attendanceToday * 0.92), reports: Math.round(stats.totalEmployees * 0.88) },
    { name: "Sat", tasks: Math.round(stats.completedTasks * 0.08), attendance: Math.round(stats.attendanceToday * 0.60), reports: Math.round(stats.totalEmployees * 0.40) },
    { name: "Sun", tasks: Math.round(stats.completedTasks * 0.05), attendance: Math.round(stats.attendanceToday * 0.50), reports: Math.round(stats.totalEmployees * 0.30) },
  ];

  const chartSummary = {
    tasks:      stats.completedTasks,
    attendance: stats.attendanceToday,
    reports:    stats.totalEmployees,
  };

  return (
    <DashboardLayout>

      {/* ── Page header ── */}
      <div className="flex items-start justify-between mb-8">
        <div>
          <p className="text-[11px] font-semibold text-white/30 uppercase tracking-widest mb-1">
            Organization Overview
          </p>
          <h1 className="text-[22px] font-semibold text-white/90 leading-tight">
            Good {getGreeting()}
            {user?.name ? `, ${user.name.split(" ")[0]}` : ""}
          </h1>
          <p className="text-[13px] text-white/35 mt-1">
            Here's your organization's performance at a glance.
          </p>
        </div>

        {/* Completion rate pill */}
        <div className="
          hidden sm:flex flex-col items-end gap-1
          px-4 py-3 rounded-xl
          bg-[#1A1A24] border border-white/[0.07]
        ">
          <p className="text-[11px] text-white/30 font-medium uppercase tracking-widest">
            Task Completion
          </p>
          <p className="text-[22px] font-semibold text-white/90 tabular-nums leading-none">
            {completionRate}
            <span className="text-[14px] text-white/40 font-normal">%</span>
          </p>
        </div>
      </div>

      {/* ── KPI grid ── */}
      <div className="grid grid-cols-2 lg:grid-cols-5 gap-4 mb-6">
        <StatsCard
          title="Employees"
          value={stats.totalEmployees}
          subtitle="Organization workforce"
          trend="neutral"
          icon={Users}
          accent="bg-[#5B73FF]/15"
          accentText="text-[#5B73FF]"
        />
        <StatsCard
          title="Teams"
          value={stats.totalTeams}
          subtitle="Active departments"
          trend="neutral"
          icon={Briefcase}
          accent="bg-[#A78BFA]/15"
          accentText="text-[#A78BFA]"
        />
        <StatsCard
          title="Total Tasks"
          value={stats.totalTasks}
          subtitle="Across all teams"
          trend="neutral"
          icon={FolderKanban}
          accent="bg-[#F59E0B]/15"
          accentText="text-[#F59E0B]"
        />
        <StatsCard
          title="Completed"
          value={stats.completedTasks}
          subtitle="Approved & closed"
          trend={stats.completedTasks > 0 ? "up" : "neutral"}
          icon={CheckSquare}
          accent="bg-[#22C97B]/15"
          accentText="text-[#22C97B]"
        />
        <StatsCard
          title="Attendance"
          value={stats.attendanceToday}
          subtitle="Checked in today"
          trend={stats.attendanceToday > 0 ? "up" : "neutral"}
          icon={Clock}
          accent="bg-[#5B73FF]/15"
          accentText="text-[#5B73FF]"
        />
      </div>

      {/* ── Progress breakdown strip ── */}
      {stats.totalTasks > 0 && (
        <div className="
          bg-[#1A1A24] border border-white/[0.07]
          rounded-xl px-5 py-4 mb-6
        ">
          <div className="flex items-center justify-between mb-3">
            <p className="text-[12px] font-semibold text-white/50 uppercase tracking-widest">
              Task Progress
            </p>
            <p className="text-[11px] text-white/25 tabular-nums">
              {stats.completedTasks} / {stats.totalTasks} completed
            </p>
          </div>

          {/* Progress bar */}
          <div className="h-2 w-full rounded-full overflow-hidden bg-white/[0.06]">
            <div
              className="h-full rounded-full bg-[#22C97B] transition-all duration-500"
              style={{ width: `${completionRate}%` }}
            />
          </div>

          {/* Stats row */}
          <div className="flex items-center gap-6 mt-3">
            {[
              { label: "Completed",   value: stats.completedTasks,                                    color: "bg-[#22C97B]" },
              { label: "In Progress", value: stats.totalTasks - stats.completedTasks,                 color: "bg-[#5B73FF]" },
              { label: "Completion",  value: `${completionRate}%`,                                    color: "bg-[#A78BFA]", isText: true },
            ].map(({ label, value, color}) => (
              <div key={label} className="flex items-center gap-1.5">
                <span className={`w-2 h-2 rounded-full ${color}`} />
                <span className="text-[11px] text-white/35">
                  {label}
                  <span className="text-white/55 font-medium ml-1 tabular-nums">{value}</span>
                </span>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* ── Bottom row: chart + quick actions ── */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">

        {/* Analytics chart */}
        <div className="lg:col-span-2">
          <AnalyticsChart
            data={chartData}
            summary={chartSummary}
            delta={{ tasks: 12, attendance: -2, reports: 8 }}
          />
        </div>

        {/* Quick actions */}
        <div className="
          bg-[#1A1A24] border border-white/[0.07]
          rounded-xl overflow-hidden
        ">
          <div className="
            flex items-center gap-2
            px-5 py-4 border-b border-white/[0.05]
          ">
            <TrendingUp size={14} className="text-white/30" />
            <h2 className="text-[13px] font-semibold text-white/70">
              Quick Actions
            </h2>
          </div>

          <div className="p-3 space-y-1">
            {[
              { label: "Manage Teams",      icon: Briefcase,    path: "/teams",        color: "text-[#A78BFA]", bg: "bg-[#A78BFA]/10" },
              { label: "All Employees",     icon: Users,        path: "/employees",    color: "text-[#5B73FF]", bg: "bg-[#5B73FF]/10" },
              { label: "Task Board",        icon: FolderKanban, path: "/tasks",        color: "text-[#F59E0B]", bg: "bg-[#F59E0B]/10" },
              { label: "Review Submissions",icon: FileText,     path: "/submissions",  color: "text-[#22C97B]", bg: "bg-[#22C97B]/10" },
              { label: "Attendance",        icon: Clock,        path: "/attendance",   color: "text-[#5B73FF]", bg: "bg-[#5B73FF]/10" },
              { label: "Activity Feed",     icon: Activity,     path: "/activity-feed",color: "text-[#A78BFA]", bg: "bg-[#A78BFA]/10" },
              { label: "Daily Reports",     icon: ClipboardList,path: "/daily-reports",color: "text-[#F59E0B]", bg: "bg-[#F59E0B]/10" },
            ].map((action) => (
              <QuickAction
                key={action.path}
                {...action}
                navigate={navigate}
              />
            ))}
          </div>
        </div>
      </div>

    </DashboardLayout>
  );
};

export default BossDashboard;