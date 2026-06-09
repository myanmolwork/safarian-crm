import { useQuery }    from "@tanstack/react-query";
import { useNavigate } from "react-router-dom";
import {
  FolderKanban,
  Timer,
  Eye,
  CheckCircle,
  ArrowRight,
  ClipboardList,
  AlertTriangle,
} from "lucide-react";
import DashboardLayout from "../../layouts/DashboardLayout";
import StatsCard       from "../../components/dashboard/StatsCard";
import Loader          from "../../components/shared/Loader";
import { getTasks }    from "../../services/taskService";
import useAuthStore    from "../../store/authStore";

// ── Upcoming task row ─────────────────────────────────────
const TaskRow = ({ task }) => {
  const deadline  = new Date(task.deadline);
  const now       = new Date();
  const daysLeft  = Math.ceil((deadline - now) / (1000 * 60 * 60 * 24));
  const isOverdue = daysLeft < 0;
  const isUrgent  = daysLeft >= 0 && daysLeft <= 2;

  return (
    <div className="
      flex items-center justify-between gap-3
      py-3 border-b border-white/[0.04] last:border-0
      group
    ">
      <div className="flex items-center gap-3 min-w-0">
        {/* Priority dot */}
        <span className={`
          w-1.5 h-1.5 rounded-full flex-shrink-0
          ${task.priority === "HIGH"   || task.priority === "URGENT"
            ? "bg-[#F43F5E]"
            : task.priority === "MEDIUM"
            ? "bg-[#5B73FF]"
            : "bg-[#22C97B]"
          }
        `} />
        <p className="text-[13px] text-white/70 truncate group-hover:text-white/90 transition-colors">
          {task.title}
        </p>
      </div>

      {/* Deadline chip */}
      <span className={`
        flex-shrink-0 text-[11px] font-medium
        px-2 py-0.5 rounded-md
        ${isOverdue
          ? "bg-[#F43F5E]/10 text-[#F43F5E]"
          : isUrgent
          ? "bg-[#F59E0B]/10 text-[#F59E0B]"
          : "bg-white/[0.04] text-white/30"
        }
      `}>
        {isOverdue
          ? `${Math.abs(daysLeft)}d overdue`
          : daysLeft === 0
          ? "Due today"
          : `${daysLeft}d left`
        }
      </span>
    </div>
  );
};

// ── WorkerDashboard ───────────────────────────────────────
const WorkerDashboard = () => {
  const navigate = useNavigate();
  const user     = useAuthStore((state) => state.user);

  const { data, isLoading } = useQuery({
    queryKey: ["worker-dashboard-tasks"],
    queryFn:  getTasks,
  });

  const tasks = data?.data ?? [];

  // ── Derived metrics ──
  const total       = tasks.length;
  const inProgress  = tasks.filter((t) => t.status === "IN_PROGRESS").length;
  const underReview = tasks.filter((t) => t.status === "UNDER_REVIEW").length;
  const approved    = tasks.filter((t) => t.status === "APPROVED").length;
  const overdue     = tasks.filter((t) => new Date(t.deadline) < new Date()).length;

  // Upcoming: non-approved, sorted by deadline, top 4
  const upcomingTasks = [...tasks]
    .filter((t) => t.status !== "APPROVED")
    .sort((a, b) => new Date(a.deadline) - new Date(b.deadline))
    .slice(0, 4);

  const completionRate = total > 0 ? Math.round((approved / total) * 100) : 0;

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
            My Workspace
          </p>
          <h1 className="text-[22px] font-semibold text-white/90 leading-tight">
            Good{" "}
            {new Date().getHours() < 12
              ? "morning"
              : new Date().getHours() < 17
              ? "afternoon"
              : "evening"}
            {user?.name ? `, ${user.name.split(" ")[0]}` : ""}
          </h1>
          <p className="text-[13px] text-white/35 mt-1">
            Here's your personal work overview for today.
          </p>
        </div>

        {/* Completion rate pill */}
        <div className="
          hidden sm:flex flex-col items-end gap-1
          px-4 py-3 rounded-xl
          bg-[#1A1A24] border border-white/[0.07]
        ">
          <p className="text-[11px] text-white/30 font-medium uppercase tracking-widest">
            Completed
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
          title="My Tasks"
          value={total}
          subtitle="Assigned to you"
          trend="neutral"
          icon={FolderKanban}
          accent="bg-[#5B73FF]/15"
          accentText="text-[#5B73FF]"
        />
        <StatsCard
          title="In Progress"
          value={inProgress}
          subtitle="Currently active"
          trend="neutral"
          icon={Timer}
          accent="bg-[#A78BFA]/15"
          accentText="text-[#A78BFA]"
        />
        <StatsCard
          title="Under Review"
          value={underReview}
          subtitle="Awaiting feedback"
          trend="neutral"
          icon={Eye}
          accent="bg-[#F59E0B]/15"
          accentText="text-[#F59E0B]"
        />
        <StatsCard
          title="Approved"
          value={approved}
          subtitle="Completed work"
          trend={approved > 0 ? "up" : "neutral"}
          icon={CheckCircle}
          accent="bg-[#22C97B]/15"
          accentText="text-[#22C97B]"
        />
      </div>

      {/* ── Overdue alert ── */}
      {overdue > 0 && (
        <div className="
          flex items-center gap-3
          px-4 py-3 mb-6 rounded-xl
          bg-[#F43F5E]/10 border border-[#F43F5E]/20
        ">
          <AlertTriangle size={15} className="text-[#F43F5E] flex-shrink-0" />
          <p className="text-[13px] text-[#F43F5E] font-medium">
            You have{" "}
            <span className="font-bold">{overdue}</span>
            {" "}overdue {overdue === 1 ? "task" : "tasks"}.
          </p>
          <button
            onClick={() => navigate("/tasks")}
            className="
              ml-auto flex items-center gap-1
              text-[12px] font-semibold text-[#F43F5E]
              hover:text-white transition-colors
            "
          >
            View tasks <ArrowRight size={12} />
          </button>
        </div>
      )}

      {/* ── Bottom row: upcoming tasks + quick actions ── */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">

        {/* Upcoming tasks */}
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
              Upcoming Tasks
            </h2>
            <button
              onClick={() => navigate("/tasks")}
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
            {upcomingTasks.length > 0
              ? upcomingTasks.map((task) => (
                  <TaskRow key={task._id} task={task} />
                ))
              : (
                <div className="py-10 text-center">
                  <p className="text-[13px] text-white/25">
                    No pending tasks. You're all caught up!
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
                label: "View My Tasks",
                icon:  FolderKanban,
                path:  "/tasks",
                color: "text-[#5B73FF]",
                bg:    "bg-[#5B73FF]/10",
              },
              {
                label: "Submit Daily Report",
                icon:  ClipboardList,
                path:  "/daily-reports",
                color: "text-[#A78BFA]",
                bg:    "bg-[#A78BFA]/10",
              },
              {
                label: "My Submissions",
                icon:  Eye,
                path:  "/submissions",
                color: "text-[#F59E0B]",
                bg:    "bg-[#F59E0B]/10",
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
                <span className="text-[13px] text-white/50 group-hover:text-white/80 transition-colors font-medium">
                  {label}
                </span>
                <ArrowRight size={12} className="ml-auto text-white/15 group-hover:text-white/40 transition-colors" />
              </button>
            ))}
          </div>
        </div>
      </div>

    </DashboardLayout>
  );
};

export default WorkerDashboard;