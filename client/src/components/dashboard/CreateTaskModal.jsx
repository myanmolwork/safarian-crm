import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { motion, AnimatePresence } from "framer-motion";
import {
  X,
  FolderKanban,
  AlertCircle,
  CheckCircle,
  Loader2,
  Calendar,
  ChevronDown,
  Flag,
  Users,
  User,
  AlignLeft,
  Type,
} from "lucide-react";
import { createTask } from "../../services/taskService";
import { getTeams }   from "../../services/teamService";
import { getUsers }   from "../../services/userService";

// ── Priority config ───────────────────────────────────────
const PRIORITIES = [
  { value: "LOW",    label: "Low",    dot: "bg-[#22C97B]", color: "text-[#22C97B]", ring: "ring-[#22C97B]/30", bg: "bg-[#22C97B]/10"  },
  { value: "MEDIUM", label: "Medium", dot: "bg-[#5B73FF]", color: "text-[#5B73FF]", ring: "ring-[#5B73FF]/30", bg: "bg-[#5B73FF]/10"  },
  { value: "HIGH",   label: "High",   dot: "bg-[#F59E0B]", color: "text-[#F59E0B]", ring: "ring-[#F59E0B]/30", bg: "bg-[#F59E0B]/10"  },
  { value: "URGENT", label: "Urgent", dot: "bg-[#F43F5E]", color: "text-[#F43F5E]", ring: "ring-[#F43F5E]/30", bg: "bg-[#F43F5E]/10"  },
];

// ── Reusable field label ──────────────────────────────────
const FieldLabel = ({ icon: Icon, children }) => (
  <label className="flex items-center gap-1.5 text-[11px] font-semibold text-white/40 uppercase tracking-widest mb-2">
    {Icon && <Icon size={11} className="text-white/25" />}
    {children}
  </label>
);

// ── Shared input className ────────────────────────────────
const inputCls = `
  w-full h-10 px-3
  bg-[#111118] border border-white/[0.07]
  rounded-lg
  text-[13px] text-white/80
  placeholder:text-white/20
  outline-none
  focus:border-[#5B73FF]/50
  focus:ring-2 focus:ring-[#5B73FF]/10
  transition-all duration-150
`;

// ── Native select wrapper (styled) ───────────────────────
const StyledSelect = ({ icon: Icon, children, ...props }) => (
  <div className="relative">
    {Icon && (
      <Icon
        size={13}
        className="absolute left-3 top-1/2 -translate-y-1/2 text-white/25 pointer-events-none"
      />
    )}
    <select
      {...props}
      className={`
        ${inputCls}
        appearance-none cursor-pointer
        ${Icon ? "pl-8" : ""}
        pr-8
      `}
    >
      {children}
    </select>
    <ChevronDown
      size={13}
      className="absolute right-3 top-1/2 -translate-y-1/2 text-white/25 pointer-events-none"
    />
  </div>
);

// ── CreateTaskModal ───────────────────────────────────────
const CreateTaskModal = ({ onClose, refetch }) => {
  const [formData, setFormData] = useState({
    title:        "",
    description:  "",
    priority:     "MEDIUM",
    deadline:     "",
    assignedTeam: "",
    assignedTo:   "",
  });
  const [status,   setStatus]   = useState("idle"); // idle | loading | success | error
  const [errorMsg, setErrorMsg] = useState("");

  // ── Data fetching ──
  const { data: teamsData } = useQuery({ queryKey: ["teams"], queryFn: getTeams });
  const { data: usersData } = useQuery({ queryKey: ["users"], queryFn: getUsers  });

  const teams     = teamsData?.data ?? [];
  const employees = (usersData?.data ?? []).filter((u) => u.role !== "BOSS");

  const selectedPriority = PRIORITIES.find((p) => p.value === formData.priority);
  const canSubmit = formData.title.trim().length > 0 && status !== "loading" && status !== "success";

  const handleChange = (e) =>
    setFormData((prev) => ({ ...prev, [e.target.name]: e.target.value }));

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!canSubmit) return;
    try {
      setStatus("loading");
      setErrorMsg("");
      await createTask({
        ...formData,
        assignedTeam: formData.assignedTeam || null,
        assignedTo:   formData.assignedTo ? [formData.assignedTo] : [],
      });
      setStatus("success");
      await refetch?.();
      setTimeout(onClose, 1000);
    } catch (error) {
      setErrorMsg(error.response?.data?.message ?? "Failed to create task.");
      setStatus("error");
    }
  };

  return (
    <AnimatePresence>
      {/* ── Backdrop ── */}
      <motion.div
        key="backdrop"
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        transition={{ duration: 0.2 }}
        onClick={onClose}
        className="fixed inset-0 z-50 bg-black/60 backdrop-blur-sm flex items-center justify-center px-4"
      >
        {/* ── Panel ── */}
        <motion.div
          key="panel"
          initial={{ opacity: 0, scale: 0.96, y: 12 }}
          animate={{ opacity: 1, scale: 1,    y: 0  }}
          exit={{    opacity: 0, scale: 0.96, y: 8  }}
          transition={{ duration: 0.2, ease: [0.16, 1, 0.3, 1] }}
          onClick={(e) => e.stopPropagation()}
          className="
            relative w-full max-w-lg
            bg-[#1A1A24]
            border border-white/[0.08]
            rounded-2xl overflow-hidden
            max-h-[90vh] flex flex-col
          "
        >
          {/* Top accent line */}
          <div className="h-px w-full bg-gradient-to-r from-transparent via-[#5B73FF]/50 to-transparent flex-shrink-0" />

          {/* ── Header ── */}
          <div className="flex items-center justify-between px-6 pt-5 pb-4 border-b border-white/[0.05] flex-shrink-0">
            <div className="flex items-center gap-3">
              <div className="flex items-center justify-center w-8 h-8 rounded-lg bg-[#5B73FF]/15">
                <FolderKanban size={15} className="text-[#5B73FF]" />
              </div>
              <div>
                <h2 className="text-[15px] font-semibold text-white/90 leading-none">
                  Create Task
                </h2>
                <p className="text-[11px] text-white/35 mt-0.5 leading-none">
                  Assign and configure a new task
                </p>
              </div>
            </div>
            <button
              type="button"
              onClick={onClose}
              aria-label="Close"
              className="
                flex items-center justify-center
                w-7 h-7 rounded-lg
                text-white/30 hover:text-white/70
                hover:bg-white/[0.06]
                transition-colors duration-150
              "
            >
              <X size={15} />
            </button>
          </div>

          {/* ── Scrollable form body ── */}
          <div className="overflow-y-auto flex-1 px-6 py-5">
            <form id="create-task-form" onSubmit={handleSubmit} className="space-y-5">

              {/* Title */}
              <div>
                <FieldLabel icon={Type}>Task Title</FieldLabel>
                <input
                  type="text"
                  name="title"
                  placeholder="e.g. Redesign landing page hero section"
                  value={formData.title}
                  onChange={handleChange}
                  autoFocus
                  className={inputCls}
                />
              </div>

              {/* Description */}
              <div>
                <FieldLabel icon={AlignLeft}>
                  Description
                  <span className="normal-case tracking-normal text-white/20 ml-1">(optional)</span>
                </FieldLabel>
                <textarea
                  name="description"
                  placeholder="Provide context, requirements, or acceptance criteria..."
                  value={formData.description}
                  onChange={handleChange}
                  rows={3}
                  className="
                    w-full px-3 py-2.5
                    bg-[#111118] border border-white/[0.07]
                    rounded-lg resize-none
                    text-[13px] text-white/80
                    placeholder:text-white/20
                    outline-none
                    focus:border-[#5B73FF]/50
                    focus:ring-2 focus:ring-[#5B73FF]/10
                    transition-all duration-150
                  "
                />
              </div>

              {/* Priority — pill selector */}
              <div>
                <FieldLabel icon={Flag}>Priority</FieldLabel>
                <div className="flex gap-2">
                  {PRIORITIES.map((p) => (
                    <button
                      key={p.value}
                      type="button"
                      onClick={() =>
                        setFormData((prev) => ({ ...prev, priority: p.value }))
                      }
                      className={`
                        flex-1 flex items-center justify-center gap-1.5
                        h-8 rounded-lg border text-[12px] font-medium
                        transition-all duration-150
                        ${formData.priority === p.value
                          ? `${p.bg} ${p.color} border-current ring-2 ${p.ring}`
                          : "bg-white/[0.03] border-white/[0.06] text-white/30 hover:text-white/60 hover:bg-white/[0.06]"
                        }
                      `}
                    >
                      <span className={`w-1.5 h-1.5 rounded-full ${
                        formData.priority === p.value ? p.dot : "bg-white/20"
                      }`} />
                      {p.label}
                    </button>
                  ))}
                </div>
              </div>

              {/* Deadline */}
              <div>
                <FieldLabel icon={Calendar}>Deadline</FieldLabel>
                <div className="relative">
                  <Calendar
                    size={13}
                    className="absolute left-3 top-1/2 -translate-y-1/2 text-white/25 pointer-events-none"
                  />
                  <input
                    type="date"
                    name="deadline"
                    value={formData.deadline}
                    onChange={handleChange}
                    className={`${inputCls} pl-8 [color-scheme:dark]`}
                  />
                </div>
              </div>

              {/* Two-column: Team + Assignee */}
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <FieldLabel icon={Users}>Team</FieldLabel>
                  <StyledSelect
                    name="assignedTeam"
                    value={formData.assignedTeam}
                    onChange={handleChange}
                    icon={Users}
                  >
                    <option value="">No team</option>
                    {teams.map((team) => (
                      <option key={team._id} value={team._id}>
                        {team.teamName}
                      </option>
                    ))}
                  </StyledSelect>
                </div>

                <div>
                  <FieldLabel icon={User}>Assignee</FieldLabel>
                  <StyledSelect
                    name="assignedTo"
                    value={formData.assignedTo}
                    onChange={handleChange}
                    icon={User}
                  >
                    <option value="">Unassigned</option>
                    {employees.map((emp) => (
                      <option key={emp._id} value={emp._id}>
                        {emp.fullName}
                      </option>
                    ))}
                  </StyledSelect>
                </div>
              </div>

              {/* Summary preview strip */}
              {formData.title && (
                <motion.div
                  initial={{ opacity: 0, y: 4 }}
                  animate={{ opacity: 1, y: 0 }}
                  className="
                    flex items-center gap-3 flex-wrap
                    px-3 py-2.5 rounded-lg
                    bg-white/[0.03] border border-white/[0.06]
                  "
                >
                  <span className="text-[11px] text-white/30 font-medium uppercase tracking-wider">Preview</span>
                  <span className="text-[12px] text-white/70 font-medium truncate max-w-[160px]">
                    {formData.title}
                  </span>
                  {selectedPriority && (
                    <span className={`
                      inline-flex items-center gap-1 text-[10px] font-semibold
                      px-2 py-0.5 rounded-md
                      ${selectedPriority.bg} ${selectedPriority.color}
                    `}>
                      <span className={`w-1 h-1 rounded-full ${selectedPriority.dot}`} />
                      {selectedPriority.label}
                    </span>
                  )}
                  {formData.deadline && (
                    <span className="inline-flex items-center gap-1 text-[10px] text-white/30">
                      <Calendar size={9} />
                      {new Date(formData.deadline).toLocaleDateString("en-US", {
                        month: "short", day: "numeric", year: "numeric",
                      })}
                    </span>
                  )}
                </motion.div>
              )}
            </form>
          </div>

          {/* ── Footer ── */}
          <div className="px-6 pb-5 pt-4 border-t border-white/[0.05] flex-shrink-0 space-y-3">
            {/* Error */}
            <AnimatePresence>
              {status === "error" && (
                <motion.div
                  initial={{ opacity: 0, height: 0 }}
                  animate={{ opacity: 1, height: "auto" }}
                  exit={{    opacity: 0, height: 0 }}
                  className="
                    flex items-center gap-2
                    px-3 py-2 rounded-lg
                    bg-[#F43F5E]/10 border border-[#F43F5E]/20
                    text-[#F43F5E] text-[12px]
                  "
                >
                  <AlertCircle size={13} className="flex-shrink-0" />
                  {errorMsg}
                </motion.div>
              )}
            </AnimatePresence>

            {/* Buttons */}
            <div className="flex gap-2">
              <button
                type="button"
                onClick={onClose}
                className="
                  flex-1 h-9 rounded-lg
                  text-[13px] font-medium text-white/40
                  hover:text-white/70 hover:bg-white/[0.05]
                  border border-white/[0.06]
                  transition-all duration-150
                "
              >
                Cancel
              </button>

              <button
                type="submit"
                form="create-task-form"
                disabled={!canSubmit}
                className={`
                  flex-1 h-9 rounded-lg
                  flex items-center justify-center gap-2
                  text-[13px] font-semibold
                  transition-all duration-200
                  ${status === "success"
                    ? "bg-[#22C97B]/20 border border-[#22C97B]/30 text-[#22C97B] cursor-default"
                    : canSubmit
                      ? "bg-[#5B73FF] hover:bg-[#4B63EE] text-white"
                      : "bg-white/[0.04] border border-white/[0.06] text-white/20 cursor-not-allowed"
                  }
                `}
              >
                {status === "loading" && <Loader2 size={13} className="animate-spin" />}
                {status === "success" && <CheckCircle size={13} />}
                {status === "loading" ? "Creating…"
                  : status === "success" ? "Task Created!"
                  : (
                    <>
                      <FolderKanban size={13} />
                      Create Task
                    </>
                  )
                }
              </button>
            </div>
          </div>
        </motion.div>
      </motion.div>
    </AnimatePresence>
  );
};

export default CreateTaskModal;