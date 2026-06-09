import { useQuery }     from "@tanstack/react-query";
import { useNavigate }  from "react-router-dom";
import {
  CheckSquare,
  Eye,
  FolderKanban,
  Timer,
  ArrowRight,
  Users,
  ClipboardList,
  FileText,
} from "lucide-react";
import DashboardLayout  from "../../layouts/DashboardLayout";
import StatsCard        from "../../components/dashboard/StatsCard";
import Loader           from "../../components/shared/Loader";
import { getTasks }     from "../../services/taskService";
import useAuthStore     from "../../store/authStore";

// ── Greeting helper ───────────────────────────────────────
const getGreeting = () => {
  const h = new Date().getHours();
  if (h < 12) return "morning";
  if (h < 17) return "afternoon";
  return "evening";
};

// ── Pending review task row ───────────────────────────────
const ReviewRow = ({ task }) => {
  const deadline  = new Date(task.deadline);
  const now       = new Date();
  const daysLeft  = Math.ceil((deadline - now) / (1000 * 60 * 60 * 24));
  const isOverdue = daysLeft < 0;

  return (
    <div className="
      flex items-center justify-between gap-3
      py-3 border-b border-white/[0.04] last:border-0
      group
    ">
      <div className="flex items-center gap-3 min-w-0">
        <span className={`
          w-1.5 h-1.5 rounded-full flex-shrink-0
          ${task.priority === "HIGH" || task.priority === "URGENT"
            ? "bg-[#F43F5E]"
            : task.priority === "MEDIUM"
            ? "bg-[#F59E0B]"
            : "bg-[#22C97B]"
          }
        `} />
        <p className="text-[13px] text-white/70 truncate group-hover:text-white/90 transition-colors">
          {task.title}
        </p>
      </div>
      <span className={`
        flex-shrink-0 text-[11px] font-medium
        px-2 py-0.5 rounded-md
        ${isOverdue
          ? "bg-[#F43F5E]/10 text-[#F43F5E]"
          : "bg-[#F59E0B]/10 text-[#F59E0B]"
        }
      `}>
        {isOverdue ? `${Math.abs(daysLeft)}d overdue` : `${daysLeft}d left`}
      </span>
    </div>
  );
};

// ── LeaderDashboard ───────────────────────────────────────
const LeaderDashboard = () => {
  const navigate = useNavigate();
  const user     = useAuthStore((state) => state.user);

  const { data, isLoading } = useQuery({
    queryKey: ["leader-dashboard-tasks"],
    queryFn:  getTasks,
  });

  const tasks = data?.data ?? [];

  // ── Derived metrics ──
  const total       = tasks.length;
  const approved    = tasks.filter((t) => t.status === "APPROVED").length;
  const underReview = tasks.filter((t) => t.status === "UNDER_REVIEW").length;
  const inProgress  = tasks.filter((t) => t.status === "IN_PROGRESS").length;
  const other       = total - approved - inProgress - underReview;
  const completionRate = total > 0 ? Math.round((approved / total) * 100) : 0;

  // Tasks pending review — sorted by deadline, top 4
  const pendingReview = [...tasks]
    .filter((t) => t.status === "UNDER_REVIEW")
    .sort((a, b) => new Date(a.deadline) - new Date(b.deadline))
    .slice(0, 4);

  // Legend items pre-filtered
  const legendItems = [
    { label: "Approved",     value: approved,    color: "bg-[#22C97B]" },
    { label: "In Progress",  value: inProgress,  color: "bg-[#5B73FF]" },
    { label: "Under Review", value: underReview, color: "bg-[#F59E0B]" },
    { label: "Other",        value: other,       color: "bg-white/[0.08]" },
  ].filter((item) => item.value > 0);

  // ── Loading ──
  if (isLoading) {
    return (
      <DashboardLayout>
        <div className="mb-8 space-y-2">
          <div className="h-6 w-48 rounded-lg bg-white/[0.06] animate-pulse" />
          <div className="h-4 w-64 rounded-lg bg-white/[0.04] animate-pulse" />
        </div>
        <Loader variant="stats" count={4} />
      </DashboardLayout>
    );
  }

  return (
    <DashboardLayout>

      {/* ── Page header ── */}
      <div className="flex items-start justify-between mb-8">
        <div>
          <p className="text-[11px] font-semibold text-white/30 uppercase tracking-widest mb-1">
            Team Leader
          </p>
          <h1 className="text-[22px] font-semibold text-white/90 leading-tight">
            Good {getGreeting()}
            {user?.name ? `, ${user.name.split(" ")[0]}` : ""}
          </h1>
          <p className="text-[13px] text-white/35 mt-1">
            Here's your team's task workflow at a glance.
          </p>
        </div>

        {/* Completion rate pill */}
        <div className="
          hidden sm:flex flex-col items-end gap-1
          px-4 py-3 rounded-xl
          bg-[#1A1A24] border border-white/[0.07]
        ">
          <p className="text-[11px] text-white/30 font-medium uppercase tracking-widest">
            Completion
          </p>
          <p className="text-[22px] font-semibold text-white/90 tabular-nums leading-none">
            {completionRate}
            <span className="text-[14px] text-white/40 font-normal">%</span>
          </p>
        </div>
      </div>

      {/* ── KPI grid ── */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
        <StatsCard
          title="Total Tasks"
          value={total}
          subtitle="Assigned to your team"
          trend="neutral"
          icon={FolderKanban}
          accent="bg-[#5B73FF]/15"
          accentText="text-[#5B73FF]"
        />
        <StatsCard
          title="In Progress"
          value={inProgress}
          subtitle="Currently being worked on"
          trend="neutral"
          icon={Timer}
          accent="bg-[#A78BFA]/15"
          accentText="text-[#A78BFA]"
        />
        <StatsCard
          title="Under Review"
          value={underReview}
          subtitle="Awaiting your decision"
          trend={underReview > 3 ? "down" : "neutral"}
          icon={Eye}
          accent="bg-[#F59E0B]/15"
          accentText="text-[#F59E0B]"
        />
        <StatsCard
          title="Approved"
          value={approved}
          subtitle="Completed & signed off"
          trend={approved > 0 ? "up" : "neutral"}
          icon={CheckSquare}
          accent="bg-[#22C97B]/15"
          accentText="text-[#22C97B]"
        />
      </div>

      {/* ── Progress breakdown ── */}
      {total > 0 && (
        <div className="
          bg-[#1A1A24] border border-white/[0.07]
          rounded-xl px-5 py-4 mb-6
        ">
          <div className="flex items-center justify-between mb-3">
            <p className="text-[12px] font-semibold text-white/50 uppercase tracking-widest">
              Task Breakdown
            </p>
            <p className="text-[11px] text-white/25 tabular-nums">
              {total} total
            </p>
          </div>

          {/* Segmented bar */}
          <div className="flex h-2 w-full rounded-full overflow-hidden gap-px">
            {approved    > 0 && <div className="bg-[#22C97B] transition-all" style={{ width: `${(approved    / total) * 100}%` }} />}
            {inProgress  > 0 && <div className="bg-[#5B73FF] transition-all" style={{ width: `${(inProgress  / total) * 100}%` }} />}
            {underReview > 0 && <div className="bg-[#F59E0B] transition-all" style={{ width: `${(underReview / total) * 100}%` }} />}
            {other       > 0 && <div className="bg-white/[0.08] flex-1" />}
          </div>

          {/* Legend */}
          <div className="flex items-center flex-wrap gap-x-5 gap-y-1.5 mt-3">
            {legendItems.map(({ label, value, color }) => (
              <div key={label} className="flex items-center gap-1.5">
                <span className={`w-2 h-2 rounded-full ${color}`} />
                <span className="text-[11px] text-white/35">
                  {label}
                  <span className="text-white/50 font-medium ml-1 tabular-nums">
                    {value}
                  </span>
                </span>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* ── Bottom row: pending review + quick actions ── */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">

        {/* Pending review list */}
        <div className="
          lg:col-span-2
          bg-[#1A1A24] border border-white/[0.07]
          rounded-xl overflow-hidden
        ">
          <div className="
            flex items-center justify-between
            px-5 py-4 border-b border-white/[0.05]
          ">
            <h2 className="text-[13px] font-semibold text-white/70">
              Pending Review
            </h2>
            <button
              onClick={() => navigate("/submissions")}
              className="
                flex items-center gap-1
                text-[11px] font-medium
                text-[#5B73FF] hover:text-white
                transition-colors
              "
            >
              View all <ArrowRight size={11} />
            </button>
          </div>

          <div className="px-5 py-1">
            {pendingReview.length > 0
              ? pendingReview.map((task) => (
                  <ReviewRow key={task._id} task={task} />
                ))
              : (
                <div className="py-10 text-center">
                  <p className="text-[13px] text-white/25">
                    No submissions pending review. All caught up!
                  </p>
                </div>
              )
            }
          </div>
        </div>

        {/* Quick actions */}
        <div className="
          bg-[#1A1A24] border border-white/[0.07]
          rounded-xl overflow-hidden
        ">
          <div className="px-5 py-4 border-b border-white/[0.05]">
            <h2 className="text-[13px] font-semibold text-white/70">
              Quick Actions
            </h2>
          </div>

          <div className="p-3 space-y-2">
            {[
              {
                label: "View Tasks",
                icon:  FolderKanban,
                path:  "/tasks",
                color: "text-[#5B73FF]",
                bg:    "bg-[#5B73FF]/10",
              },
              {
                label: "Review Submissions",
                icon:  FileText,
                path:  "/submissions",
                color: "text-[#F59E0B]",
                bg:    "bg-[#F59E0B]/10",
              },
              {
                label: "Team Members",
                icon:  Users,
                path:  "/teams",
                color: "text-[#A78BFA]",
                bg:    "bg-[#A78BFA]/10",
              },
              {
                label: "Daily Reports",
                icon:  ClipboardList,
                path:  "/daily-reports",
                color: "text-[#22C97B]",
                bg:    "bg-[#22C97B]/10",
              },
            ].map(({ label, icon: Icon, path, color, bg }) => (
              <button
                key={path}
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
            ))}
          </div>
        </div>
      </div>

    </DashboardLayout>
  );
};

export default LeaderDashboard;