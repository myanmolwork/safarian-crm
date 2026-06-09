import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  X,
  Briefcase,
  ChevronDown,
  CheckCircle,
  AlertCircle,
  Loader2,
} from "lucide-react";
import { createTeam } from "../../services/teamService";

// ── Department options with metadata ─────────────────────
const DEPARTMENTS = [
  {
    value: "CONTENT",
    label: "Content",
    description: "Articles, blogs & written assets",
    color: "bg-[#5B73FF]/15 text-[#5B73FF] border-[#5B73FF]/20",
    dot:   "bg-[#5B73FF]",
  },
  {
    value: "MARKETING",
    label: "Marketing",
    description: "Campaigns, growth & analytics",
    color: "bg-[#22C97B]/15 text-[#22C97B] border-[#22C97B]/20",
    dot:   "bg-[#22C97B]",
  },
  {
    value: "SOCIAL_MEDIA",
    label: "Social Media",
    description: "Posts, engagement & community",
    color: "bg-[#A78BFA]/15 text-[#A78BFA] border-[#A78BFA]/20",
    dot:   "bg-[#A78BFA]",
  },
  {
    value: "VIDEO_EDITING",
    label: "Video Editing",
    description: "Edits, reels & motion graphics",
    color: "bg-[#F59E0B]/15 text-[#F59E0B] border-[#F59E0B]/20",
    dot:   "bg-[#F59E0B]",
  },
];

// ── CreateTeamModal ───────────────────────────────────────
const CreateTeamModal = ({ onClose, refetch }) => {
  const [teamName,       setTeamName]       = useState("");
  const [departmentType, setDepartmentType] = useState("CONTENT");
  const [status,         setStatus]         = useState("idle"); // idle | loading | success | error
  const [errorMsg,       setErrorMsg]       = useState("");
  const [dropdownOpen,   setDropdownOpen]   = useState(false);

  const selectedDept = DEPARTMENTS.find((d) => d.value === departmentType);
  const canSubmit    = teamName.trim().length > 0 && status !== "loading" && status !== "success";

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!canSubmit) return;
    try {
      setStatus("loading");
      setErrorMsg("");
      await createTeam({ teamName: teamName.trim(), departmentType });
      setStatus("success");
      await refetch?.();
      setTimeout(onClose, 1000);
    } catch (error) {
      setErrorMsg(error.response?.data?.message ?? "Failed to create team.");
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
            relative w-full max-w-md
            bg-[#1A1A24]
            border border-white/[0.08]
            rounded-2xl overflow-hidden
          "
        >
          {/* Top accent line */}
          <div className="h-px w-full bg-gradient-to-r from-transparent via-[#5B73FF]/50 to-transparent" />

          <div className="p-6">
            {/* ── Header ── */}
            <div className="flex items-center justify-between mb-6">
              <div className="flex items-center gap-3">
                <div className="
                  flex items-center justify-center
                  w-8 h-8 rounded-lg
                  bg-[#5B73FF]/15
                ">
                  <Briefcase size={15} className="text-[#5B73FF]" />
                </div>
                <div>
                  <h2 className="text-[15px] font-semibold text-white/90 leading-none">
                    Create Team
                  </h2>
                  <p className="text-[11px] text-white/35 mt-0.5 leading-none">
                    Set up a new department team
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

            <form onSubmit={handleSubmit} className="space-y-4">
              {/* ── Team name input ── */}
              <div>
                <label className="block text-[11px] font-semibold text-white/40 uppercase tracking-widest mb-2">
                  Team Name
                </label>
                <input
                  type="text"
                  placeholder="e.g. Growth Marketing"
                  value={teamName}
                  onChange={(e) => setTeamName(e.target.value)}
                  autoFocus
                  className="
                    w-full h-10 px-3
                    bg-[#111118] border border-white/[0.07]
                    rounded-lg
                    text-[13px] text-white/80
                    placeholder:text-white/20
                    outline-none
                    focus:border-[#5B73FF]/50
                    focus:ring-2 focus:ring-[#5B73FF]/10
                    transition-all duration-150
                  "
                />
              </div>

              {/* ── Department custom dropdown ── */}
              <div>
                <label className="block text-[11px] font-semibold text-white/40 uppercase tracking-widest mb-2">
                  Department
                </label>

                <div className="relative">
                  {/* Trigger */}
                  <button
                    type="button"
                    onClick={() => setDropdownOpen((v) => !v)}
                    className="
                      w-full h-10 px-3
                      flex items-center justify-between
                      bg-[#111118] border border-white/[0.07]
                      rounded-lg
                      text-[13px] text-white/80
                      hover:border-white/[0.14]
                      focus:border-[#5B73FF]/50
                      focus:ring-2 focus:ring-[#5B73FF]/10
                      outline-none
                      transition-all duration-150
                    "
                  >
                    <span className="flex items-center gap-2">
                      <span className={`w-1.5 h-1.5 rounded-full flex-shrink-0 ${selectedDept?.dot}`} />
                      {selectedDept?.label}
                    </span>
                    <ChevronDown
                      size={14}
                      className={`text-white/30 transition-transform duration-150 ${dropdownOpen ? "rotate-180" : ""}`}
                    />
                  </button>

                  {/* Dropdown list */}
                  <AnimatePresence>
                    {dropdownOpen && (
                      <motion.div
                        initial={{ opacity: 0, y: -4, scale: 0.98 }}
                        animate={{ opacity: 1, y: 0,  scale: 1    }}
                        exit={{    opacity: 0, y: -4, scale: 0.98 }}
                        transition={{ duration: 0.15 }}
                        className="
                          absolute z-10 top-full mt-1.5
                          w-full
                          bg-[#1A1A24]
                          border border-white/[0.08]
                          rounded-xl
                          overflow-hidden
                          shadow-xl shadow-black/40
                        "
                      >
                        {DEPARTMENTS.map((dept) => (
                          <button
                            key={dept.value}
                            type="button"
                            onClick={() => {
                              setDepartmentType(dept.value);
                              setDropdownOpen(false);
                            }}
                            className={`
                              w-full flex items-center gap-3
                              px-3 py-2.5 text-left
                              hover:bg-white/[0.05]
                              transition-colors duration-100
                              ${departmentType === dept.value ? "bg-white/[0.04]" : ""}
                            `}
                          >
                            {/* Color dot */}
                            <span className={`w-1.5 h-1.5 rounded-full flex-shrink-0 ${dept.dot}`} />

                            {/* Label + description */}
                            <div className="flex-1 min-w-0">
                              <p className="text-[13px] text-white/80 font-medium leading-none">
                                {dept.label}
                              </p>
                              <p className="text-[11px] text-white/30 mt-0.5 leading-none">
                                {dept.description}
                              </p>
                            </div>

                            {/* Selected checkmark */}
                            {departmentType === dept.value && (
                              <CheckCircle size={13} className="text-[#5B73FF] flex-shrink-0" />
                            )}
                          </button>
                        ))}
                      </motion.div>
                    )}
                  </AnimatePresence>
                </div>

                {/* Selected department badge preview */}
                {selectedDept && (
                  <div className="mt-2">
                    <span className={`
                      inline-flex items-center gap-1.5
                      text-[11px] font-medium
                      px-2 py-1 rounded-md border
                      ${selectedDept.color}
                    `}>
                      <span className={`w-1 h-1 rounded-full ${selectedDept.dot}`} />
                      {selectedDept.label}
                    </span>
                  </div>
                )}
              </div>

              {/* ── Error message ── */}
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

              {/* ── Actions ── */}
              <div className="flex gap-2 pt-2">
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
                  {status === "loading" && (
                    <Loader2 size={13} className="animate-spin" />
                  )}
                  {status === "success" && <CheckCircle size={13} />}

                  {status === "loading" ? "Creating…"
                    : status === "success" ? "Created!"
                    : "Create Team"
                  }
                </button>
              </div>
            </form>
          </div>
        </motion.div>
      </motion.div>
    </AnimatePresence>
  );
};

export default CreateTeamModal;