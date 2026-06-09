import { useState, useEffect, useCallback } from "react";
import { useQuery, useQueryClient }         from "@tanstack/react-query";
import {
  DndContext,
  DragOverlay,
  PointerSensor,
  useSensor,
  useSensors,
  closestCorners,
} from "@dnd-kit/core";
import { motion, AnimatePresence } from "framer-motion";
import {
  Plus,
  FolderKanban,
  CheckSquare,
  Timer,
  Eye,
  Circle,
} from "lucide-react";
import DashboardLayout   from "../../layouts/DashboardLayout";
import KanbanColumn      from "../../components/dashboard/KanbanColumn";
import TaskCard          from "../../components/dashboard/TaskCard";
import CreateTaskModal   from "../../components/dashboard/CreateTaskModal";
import Loader            from "../../components/shared/Loader";
import EmptyState        from "../../components/shared/EmptyState";
import { getTasks, updateTaskStatus } from "../../services/taskService";
import socket            from "../../services/socket";
import useAuthStore      from "../../store/authStore";

// ── Column definitions ────────────────────────────────────
const COLUMNS = [
  {
    status:     "TODO",
    title:      "Todo",
    icon:       Circle,
    iconColor:  "text-white/30",
    countBg:    "bg-white/[0.06] text-white/40",
  },
  {
    status:     "IN_PROGRESS",
    title:      "In Progress",
    icon:       Timer,
    iconColor:  "text-[#5B73FF]",
    countBg:    "bg-[#5B73FF]/15 text-[#5B73FF]",
  },
  {
    status:     "UNDER_REVIEW",
    title:      "Under Review",
    icon:       Eye,
    iconColor:  "text-[#F59E0B]",
    countBg:    "bg-[#F59E0B]/15 text-[#F59E0B]",
  },
  {
    status:     "APPROVED",
    title:      "Approved",
    icon:       CheckSquare,
    iconColor:  "text-[#22C97B]",
    countBg:    "bg-[#22C97B]/15 text-[#22C97B]",
  },
];

// ── Mini stat chip ────────────────────────────────────────
const StatChip = ({ icon: Icon, iconColor, countBg, count, label }) => (
  <div className="flex items-center gap-2">
    <Icon size={12} className={iconColor} />
    <span className={`
      text-[11px] font-semibold px-2 py-0.5 rounded-md tabular-nums
      ${countBg}
    `}>
      {count}
    </span>
    <span className="text-[11px] text-white/25 hidden sm:block">{label}</span>
  </div>
);

// ── TasksPage ─────────────────────────────────────────────
const TasksPage = () => {
  const queryClient              = useQueryClient();
  const [showModal, setShowModal] = useState(false);
  const [activeTask, setActiveTask] = useState(null); // for DragOverlay

  const role         = useAuthStore((state) => state.user?.role);
  const canCreateTask = role === "BOSS" || role === "TEAM_LEADER";

  // ── Sensors: require 8px move before drag starts ──
  const sensors = useSensors(
    useSensor(PointerSensor, {
      activationConstraint: { distance: 8 },
    })
  );

  const { data, isLoading, refetch } = useQuery({
    queryKey: ["tasks"],
    queryFn:  getTasks,
  });

  // ── Socket — optimistic refetch ──
  useEffect(() => {
    socket.on("taskUpdated", refetch);
    return () => socket.off("taskUpdated", refetch);
  }, [refetch]);

  const tasks = data?.data ?? [];

  // ── Column buckets ──
  const columnTasks = COLUMNS.reduce((acc, col) => {
    acc[col.status] = tasks.filter((t) => t.status === col.status);
    return acc;
  }, {});

  // ── Derived counts ──
  const total     = tasks.length;
  const completed = tasks.filter((t) => t.status === "APPROVED").length;
  const overdue   = tasks.filter((t) => new Date(t.deadline) < new Date()).length;

  // ── Drag handlers ──
  const handleDragStart = useCallback((event) => {
    const task = tasks.find((t) => t._id === event.active.id);
    setActiveTask(task ?? null);
  }, [tasks]);

  const handleDragEnd = useCallback(async (event) => {
    setActiveTask(null);
    const { active, over } = event;
    if (!over || active.id === over.id) return;

    const taskId   = active.id;
    const newStatus = over.id;

    // Optimistic update
    queryClient.setQueryData(["tasks"], (old) => ({
      ...old,
      data: {
        ...old?.data,
        data: (old?.data?.data ?? []).map((t) =>
          t._id === taskId ? { ...t, status: newStatus } : t
        ),
      },
    }));

    try {
      await updateTaskStatus(taskId, newStatus);
    } catch {
      refetch(); // rollback on error
    }
  }, [queryClient, refetch]);

  const handleDragCancel = useCallback(() => setActiveTask(null), []);

  // ── Loading ──
  if (isLoading) {
    return (
      <DashboardLayout>
        <div className="mb-8 space-y-2">
          <div className="h-6 w-40 rounded-lg bg-white/[0.06] animate-pulse" />
          <div className="h-4 w-56 rounded-lg bg-white/[0.04] animate-pulse" />
        </div>
        <Loader variant="kanban" count={3} />
      </DashboardLayout>
    );
  }

  return (
    <DashboardLayout>

      {/* ── Page header ── */}
      <div className="flex items-start justify-between mb-8">
        <div>
          <p className="text-[11px] font-semibold text-white/30 uppercase tracking-widest mb-1">
            Workflow
          </p>
          <h1 className="text-[22px] font-semibold text-white/90 leading-tight">
            Task Board
          </h1>
          <p className="text-[13px] text-white/35 mt-1">
            Drag tasks between columns to update their status.
          </p>
        </div>

        <div className="flex items-center gap-3">
          {/* Overdue warning */}
          {overdue > 0 && (
            <div className="
              hidden sm:flex flex-col items-end gap-1
              px-3 py-2 rounded-xl
              bg-[#F43F5E]/10 border border-[#F43F5E]/20
            ">
              <p className="text-[10px] text-[#F43F5E]/60 font-medium uppercase tracking-widest">
                Overdue
              </p>
              <p className="text-[18px] font-semibold text-[#F43F5E] tabular-nums leading-none">
                {overdue}
              </p>
            </div>
          )}

          {/* Completion pill */}
          <div className="
            hidden sm:flex flex-col items-end gap-1
            px-4 py-3 rounded-xl
            bg-[#1A1A24] border border-white/[0.07]
          ">
            <p className="text-[11px] text-white/30 font-medium uppercase tracking-widest">
              Completed
            </p>
            <p className="text-[22px] font-semibold text-white/90 tabular-nums leading-none">
              {completed}
              <span className="text-[13px] text-white/30 font-normal">/{total}</span>
            </p>
          </div>

          {/* Create task button */}
          {canCreateTask && (
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
              New Task
            </button>
          )}
        </div>
      </div>

      {/* ── Board stats strip ── */}
      {total > 0 && (
        <div className="
          flex items-center gap-5 flex-wrap
          px-5 py-3 mb-6
          bg-[#1A1A24] border border-white/[0.07]
          rounded-xl
        ">
          <div className="flex items-center gap-1.5 text-[11px] text-white/30">
            <FolderKanban size={12} className="text-white/25" />
            <span className="tabular-nums font-medium text-white/50">{total}</span>
            total tasks
          </div>

          <div className="w-px h-4 bg-white/[0.06]" />

          {COLUMNS.map((col) => (
            <StatChip
              key={col.status}
              icon={col.icon}
              iconColor={col.iconColor}
              countBg={col.countBg}
              count={columnTasks[col.status].length}
              label={col.title}
            />
          ))}

          {/* Progress bar */}
          <div className="ml-auto hidden md:flex items-center gap-3 flex-shrink-0">
            <span className="text-[11px] text-white/25">
              {total > 0 ? Math.round((completed / total) * 100) : 0}% done
            </span>
            <div className="w-24 h-1.5 rounded-full bg-white/[0.06] overflow-hidden">
              <div
                className="h-full rounded-full bg-[#22C97B] transition-all duration-500"
                style={{ width: `${total > 0 ? (completed / total) * 100 : 0}%` }}
              />
            </div>
          </div>
        </div>
      )}

      {/* ── Board or empty ── */}
      {tasks.length === 0 ? (
        <EmptyState
          preset="tasks"
          title="No tasks yet"
          description="Create your first task to start managing your team's workflow."
          action={canCreateTask
            ? { label: "Create Task", onClick: () => setShowModal(true) }
            : undefined
          }
        />
      ) : (
        <DndContext
          sensors={sensors}
          collisionDetection={closestCorners}
          onDragStart={handleDragStart}
          onDragEnd={handleDragEnd}
          onDragCancel={handleDragCancel}
        >
          <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-4 gap-4">
            {COLUMNS.map((col) => (
              <KanbanColumn
                key={col.status}
                title={col.title}
                tasks={columnTasks[col.status]}
                status={col.status}
                onAddTask={canCreateTask ? () => setShowModal(true) : undefined}
              />
            ))}
          </div>

          {/* ── Drag overlay — floating card while dragging ── */}
          <DragOverlay>
            <AnimatePresence>
              {activeTask && (
                <motion.div
                  initial={{ scale: 1.02, opacity: 0.9 }}
                  animate={{ scale: 1.04, opacity: 1   }}
                  className="rotate-1 cursor-grabbing shadow-2xl shadow-black/50"
                >
                  <TaskCard task={activeTask} />
                </motion.div>
              )}
            </AnimatePresence>
          </DragOverlay>
        </DndContext>
      )}

      {/* ── Create task modal ── */}
      <AnimatePresence>
        {showModal && canCreateTask && (
          <CreateTaskModal
            onClose={() => setShowModal(false)}
            refetch={refetch}
          />
        )}
      </AnimatePresence>

    </DashboardLayout>
  );
};

export default TasksPage;