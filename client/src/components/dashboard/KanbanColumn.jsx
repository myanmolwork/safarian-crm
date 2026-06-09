import { SortableContext } from "@dnd-kit/sortable";
import { useDroppable }    from "@dnd-kit/core";
import { motion, AnimatePresence } from "framer-motion";
import { Plus } from "lucide-react";
import TaskCard from "./TaskCard";

// ── Column config ─────────────────────────────────────────
const columnConfig = {
  TODO: {
    label:       "Todo",
    countColor:  "bg-white/[0.06] text-white/40",
    accentColor: "bg-white/[0.04]",
    dotColor:    "bg-white/20",
  },
  IN_PROGRESS: {
    label:       "In Progress",
    countColor:  "bg-[#5B73FF]/15 text-[#5B73FF]",
    accentColor: "bg-[#5B73FF]/[0.03]",
    dotColor:    "bg-[#5B73FF]",
  },
  IN_REVIEW: {
    label:       "In Review",
    countColor:  "bg-[#F59E0B]/15 text-[#F59E0B]",
    accentColor: "bg-[#F59E0B]/[0.03]",
    dotColor:    "bg-[#F59E0B]",
  },
  DONE: {
    label:       "Done",
    countColor:  "bg-[#22C97B]/15 text-[#22C97B]",
    accentColor: "bg-[#22C97B]/[0.03]",
    dotColor:    "bg-[#22C97B]",
  },
};

// ── Empty state ───────────────────────────────────────────
const EmptyColumn = ({ status }) => (
  <div className="
    flex flex-col items-center justify-center
    py-10 px-4 text-center
    border border-dashed border-white/[0.06]
    rounded-xl
  ">
    <p className="text-[12px] text-white/20 leading-relaxed">
      {status === "TODO"
        ? "No tasks yet. Add one to get started."
        : status === "IN_PROGRESS"
        ? "Nothing in progress. Pull tasks from Todo."
        : status === "IN_REVIEW"
        ? "Nothing to review yet."
        : "Completed tasks will appear here."}
    </p>
  </div>
);

// ── KanbanColumn ──────────────────────────────────────────
const KanbanColumn = ({
  title,
  tasks,
  status,
  onAddTask, // optional — wire to your "add task" handler
}) => {
  const { setNodeRef, isOver } = useDroppable({ id: status });

  const config = columnConfig[status] ?? {
    label:       title,
    countColor:  "bg-white/[0.06] text-white/40",
    accentColor: "bg-white/[0.04]",
    dotColor:    "bg-white/20",
  };

  // High / overdue counts for column analytics
  const highCount    = tasks.filter((t) => t.priority === "HIGH").length;
  const overdueCount = tasks.filter((t) => new Date(t.deadline) < new Date()).length;

  return (
    <div
      ref={setNodeRef}
      className={`
        flex flex-col
        min-h-[520px] w-full
        rounded-xl
        border
        transition-colors duration-150
        ${isOver
          ? "border-[#5B73FF]/40 bg-[#5B73FF]/[0.04]"
          : "border-white/[0.06] bg-[#111118]"
        }
      `}
    >
      {/* ── Column header ── */}
      <div className="flex items-center gap-2.5 px-4 pt-4 pb-3 border-b border-white/[0.05]">
        {/* Status dot */}
        <span className={`w-1.5 h-1.5 rounded-full flex-shrink-0 ${config.dotColor}`} />

        {/* Title */}
        <h3 className="text-[13px] font-semibold text-white/70 flex-1 tracking-tight">
          {config.label}
        </h3>

        {/* Task count badge */}
        <span className={`
          text-[11px] font-semibold
          px-2 py-0.5 rounded-md
          tabular-nums
          ${config.countColor}
        `}>
          {tasks.length}
        </span>

        {/* Add task button (optional) */}
        {onAddTask && (
          <button
            onClick={() => onAddTask(status)}
            aria-label={`Add task to ${config.label}`}
            className="
              flex items-center justify-center
              w-5 h-5 rounded-md
              text-white/20 hover:text-white/60
              hover:bg-white/[0.06]
              transition-colors duration-150
            "
          >
            <Plus size={13} />
          </button>
        )}
      </div>

      {/* ── Column analytics strip ── */}
      {tasks.length > 0 && (highCount > 0 || overdueCount > 0) && (
        <div className="flex items-center gap-3 px-4 py-2 border-b border-white/[0.04]">
          {highCount > 0 && (
            <span className="text-[10px] text-[#F43F5E]/70 flex items-center gap-1">
              <span className="w-1 h-1 rounded-full bg-[#F43F5E]" />
              {highCount} high priority
            </span>
          )}
          {overdueCount > 0 && (
            <span className="text-[10px] text-[#F59E0B]/70 flex items-center gap-1">
              <span className="w-1 h-1 rounded-full bg-[#F59E0B]" />
              {overdueCount} overdue
            </span>
          )}
        </div>
      )}

      {/* ── Task list ── */}
      <div className="flex-1 p-3">
        <SortableContext items={tasks.map((t) => t._id)}>
          {tasks.length === 0 ? (
            <EmptyColumn status={status} />
          ) : (
            <div className="space-y-2.5">
              <AnimatePresence initial={false}>
                {tasks.map((task, index) => (
                  <motion.div
                    key={task._id}
                    initial={{ opacity: 0, y: 8  }}
                    animate={{ opacity: 1, y: 0  }}
                    exit={{    opacity: 0, y: -4, scale: 0.98 }}
                    transition={{
                      duration: 0.18,
                      delay:    index * 0.03,
                      ease:     "easeOut",
                    }}
                  >
                    <TaskCard task={task} />
                  </motion.div>
                ))}
              </AnimatePresence>
            </div>
          )}
        </SortableContext>
      </div>

      {/* ── Drop target glow when dragging over ── */}
      {isOver && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{    opacity: 0 }}
          className="
            mx-3 mb-3 h-16 rounded-xl
            border-2 border-dashed border-[#5B73FF]/30
            bg-[#5B73FF]/[0.05]
            flex items-center justify-center
          "
        >
          <span className="text-[11px] text-[#5B73FF]/50">Drop here</span>
        </motion.div>
      )}
    </div>
  );
};

export default KanbanColumn;