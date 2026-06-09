import { useState } from "react";
import { useSortable } from "@dnd-kit/sortable";
import { CSS } from "@dnd-kit/utilities";
import { motion } from "framer-motion";
import {
  Calendar,
  Upload,
  GripVertical,
  Clock,
} from "lucide-react";
import StatusBadge from "../shared/StatusBadge";
import PriorityBadge from "../shared/PriorityBadge";
import SubmissionModal from "./SubmissionModal";
import useAuthStore from "../../store/authStore";

// ── Helpers ──────────────────────────────────────────────
const formatDeadline = (deadline) => {
  const date  = new Date(deadline);
  const now   = new Date();
  const diff  = Math.ceil((date - now) / (1000 * 60 * 60 * 24));
  const label = date.toLocaleDateString("en-US", { month: "short", day: "numeric" });

  if (diff < 0)  return { label, state: "overdue" };
  if (diff <= 2) return { label, state: "urgent" };
  return { label, state: "normal" };
};

const deadlineStyles = {
  overdue: "text-[#F43F5E] bg-[#F43F5E]/10",
  urgent:  "text-[#F59E0B] bg-[#F59E0B]/10",
  normal:  "text-white/35 bg-white/[0.04]",
};

// Priority → left border color
const priorityBorder = {
  HIGH:   "border-l-[#F43F5E]",
  MEDIUM: "border-l-[#F59E0B]",
  LOW:    "border-l-[#22C97B]",
};

// ── Component ─────────────────────────────────────────────
const TaskCard = ({ task }) => {
  const [showSubmissionModal, setShowSubmissionModal] = useState(false);
  const role = useAuthStore((state) => state.user?.role);

  const {
    attributes,
    listeners,
    setNodeRef,
    transform,
    transition,
    isDragging,
  } = useSortable({ id: task._id });

  const style = {
    transform:  CSS.Transform.toString(transform),
    transition,
    opacity:    isDragging ? 0.4 : 1,
  };

  const deadline      = formatDeadline(task.deadline);
  const borderColor   = priorityBorder[task.priority] ?? "border-l-white/10";

  // Assignee initials
  const initials = task.assignee?.name
    ? task.assignee.name.split(" ").map((n) => n[0]).join("").slice(0, 2).toUpperCase()
    : null;

  return (
    <>
      <motion.div
        ref={setNodeRef}
        style={style}
        whileHover={{ y: isDragging ? 0 : -2 }}
        whileTap={{ scale: 0.99 }}
        className={`
          relative group
          bg-[#1A1A24]
          border border-white/[0.07] border-l-2 ${borderColor}
          rounded-xl p-4
          cursor-grab active:cursor-grabbing
          hover:border-white/[0.13]
          transition-colors duration-150
        `}
      >
        {/* ── Drag handle — visible on hover ── */}
        <div
          {...attributes}
          {...listeners}
          className="
            absolute top-3 right-3
            opacity-0 group-hover:opacity-100
            transition-opacity duration-150
            text-white/20 hover:text-white/50
            cursor-grab active:cursor-grabbing
            p-0.5 rounded
          "
        >
          <GripVertical size={14} />
        </div>

        {/* ── Title + description ── */}
        <div className="mb-3 pr-5">
          <h3 className="text-[13px] font-semibold text-white/90 leading-snug line-clamp-2">
            {task.title}
          </h3>
          {task.description && (
            <p className="text-[12px] text-white/35 mt-1 leading-relaxed line-clamp-2">
              {task.description}
            </p>
          )}
        </div>

        {/* ── Status + Priority badges ── */}
        <div className="flex items-center gap-2 mb-3">
          <StatusBadge   status={task.status} />
          <PriorityBadge priority={task.priority} />
        </div>

        {/* ── Footer: assignee + deadline ── */}
        <div className="flex items-center justify-between mt-1">
          {/* Assignee avatar */}
          {initials ? (
            <div
              title={task.assignee?.name}
              className="
                w-6 h-6 rounded-full
                bg-[#5B73FF]/20 text-[#5B73FF]
                flex items-center justify-center
                text-[9px] font-bold
                flex-shrink-0
              "
            >
              {initials}
            </div>
          ) : (
            <div className="w-6 h-6 rounded-full bg-white/[0.04] border border-dashed border-white/10 flex-shrink-0" />
          )}

          {/* Deadline chip */}
          <span className={`
            flex items-center gap-1
            text-[11px] font-medium
            px-2 py-0.5 rounded-md
            ${deadlineStyles[deadline.state]}
          `}>
            {deadline.state === "overdue"
              ? <Clock size={10} />
              : <Calendar size={10} />
            }
            {deadline.state === "overdue" ? "Overdue · " : ""}{deadline.label}
          </span>
        </div>

        {/* ── Worker: Submit Work button ── */}
        {role === "WORKER" && (
          <button
            onClick={(e) => {
              e.stopPropagation();
              setShowSubmissionModal(true);
            }}
            className="
              mt-3 w-full
              flex items-center justify-center gap-2
              h-8 rounded-lg
              bg-[#5B73FF]/15 hover:bg-[#5B73FF]/25
              border border-[#5B73FF]/20 hover:border-[#5B73FF]/40
              text-[#5B73FF] text-[12px] font-medium
              transition-all duration-150
            "
          >
            <Upload size={12} />
            Submit Work
          </button>
        )}
      </motion.div>

      {showSubmissionModal && (
        <SubmissionModal
          taskId={task._id}
          onClose={() => setShowSubmissionModal(false)}
        />
      )}
    </>
  );
};

export default TaskCard;