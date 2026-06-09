import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  X,
  UserPlus,
  User,
  Mail,
  Lock,
  Eye,
  EyeOff,
  AlertCircle,
  CheckCircle,
  Loader2,
  Shield,
  Briefcase,
} from "lucide-react";
import { createUser } from "../../services/userService";

// ── Role config ───────────────────────────────────────────
const ROLES = [
  {
    value:       "WORKER",
    label:       "Worker",
    description: "Can view and complete assigned tasks",
    icon:        User,
    color:       "text-[#5B73FF]",
    bg:          "bg-[#5B73FF]/10",
    border:      "border-[#5B73FF]/25",
    ring:        "ring-[#5B73FF]/20",
  },
  {
    value:       "TEAM_LEADER",
    label:       "Team Leader",
    description: "Can manage team members and review submissions",
    icon:        Briefcase,
    color:       "text-[#A78BFA]",
    bg:          "bg-[#A78BFA]/10",
    border:      "border-[#A78BFA]/25",
    ring:        "ring-[#A78BFA]/20",
  },
];

// ── Password strength ─────────────────────────────────────
const getPasswordStrength = (pwd) => {
  if (!pwd) return null;
  let score = 0;
  if (pwd.length >= 8)          score++;
  if (/[A-Z]/.test(pwd))        score++;
  if (/[0-9]/.test(pwd))        score++;
  if (/[^A-Za-z0-9]/.test(pwd)) score++;
  if (score <= 1) return { label: "Weak",   color: "bg-[#F43F5E]", width: "w-1/4"  };
  if (score === 2) return { label: "Fair",   color: "bg-[#F59E0B]", width: "w-2/4"  };
  if (score === 3) return { label: "Good",   color: "bg-[#5B73FF]", width: "w-3/4"  };
  return              { label: "Strong", color: "bg-[#22C97B]", width: "w-full"  };
};

// ── Avatar preview ────────────────────────────────────────
const AvatarPreview = ({ name, role }) => {
  const initials = name
    ? name.split(" ").map((n) => n[0]).join("").slice(0, 2).toUpperCase()
    : null;
  const roleConfig = ROLES.find((r) => r.value === role);

  return (
    <div className="flex items-center gap-3 px-3 py-2.5 rounded-lg bg-white/[0.03] border border-white/[0.06]">
      <div className={`
        w-9 h-9 rounded-full flex-shrink-0
        flex items-center justify-center
        text-[13px] font-semibold
        ${roleConfig?.bg ?? "bg-white/[0.06]"}
        ${roleConfig?.color ?? "text-white/40"}
      `}>
        {initials ?? <User size={16} className="text-white/20" />}
      </div>
      <div className="flex-1 min-w-0">
        <p className="text-[13px] font-medium text-white/80 leading-none truncate">
          {name || <span className="text-white/20 font-normal">Full name</span>}
        </p>
        <p className={`text-[11px] mt-0.5 leading-none ${roleConfig?.color ?? "text-white/25"}`}>
          {roleConfig?.label ?? "Role"}
        </p>
      </div>
      <span className={`
        text-[10px] font-semibold px-2 py-0.5 rounded-md border
        ${roleConfig?.bg} ${roleConfig?.color} ${roleConfig?.border}
      `}>
        {roleConfig?.label}
      </span>
    </div>
  );
};

// ── Input field ───────────────────────────────────────────
const InputField = ({ icon: Icon, label, rightEl, ...props }) => (
  <div>
    <label className="flex items-center gap-1.5 text-[11px] font-semibold text-white/40 uppercase tracking-widest mb-2">
      {Icon && <Icon size={11} className="text-white/25" />}
      {label}
    </label>
    <div className="relative">
      {Icon && (
        <Icon
          size={14}
          className="absolute left-3 top-1/2 -translate-y-1/2 text-white/25 pointer-events-none"
        />
      )}
      <input
        {...props}
        className={`
          w-full h-10 bg-[#111118]
          border border-white/[0.07]
          rounded-lg
          text-[13px] text-white/80
          placeholder:text-white/20
          outline-none
          focus:border-[#5B73FF]/50
          focus:ring-2 focus:ring-[#5B73FF]/10
          transition-all duration-150
          ${Icon    ? "pl-9"  : "pl-3"}
          ${rightEl ? "pr-10" : "pr-3"}
        `}
      />
      {rightEl && (
        <div className="absolute right-3 top-1/2 -translate-y-1/2">
          {rightEl}
        </div>
      )}
    </div>
  </div>
);

// ── CreateEmployeeModal ───────────────────────────────────
const CreateEmployeeModal = ({ onClose, refetch }) => {
  const [formData, setFormData] = useState({
    fullName: "",
    email:    "",
    password: "",
    role:     "WORKER",
  });
  const [showPassword, setShowPassword] = useState(false);
  const [status,       setStatus]       = useState("idle");
  const [errorMsg,     setErrorMsg]     = useState("");

  const passwordStrength = getPasswordStrength(formData.password);
  const canSubmit =
    formData.fullName.trim() &&
    formData.email.trim() &&
    formData.password.length >= 6 &&
    status !== "loading" &&
    status !== "success";

  const handleChange = (e) =>
    setFormData((prev) => ({ ...prev, [e.target.name]: e.target.value }));

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!canSubmit) return;
    try {
      setStatus("loading");
      setErrorMsg("");
      await createUser(formData);
      setStatus("success");
      await refetch?.();
      setTimeout(onClose, 1000);
    } catch (error) {
      setErrorMsg(error.response?.data?.message ?? "Failed to create employee.");
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
                <div className="flex items-center justify-center w-8 h-8 rounded-lg bg-[#5B73FF]/15">
                  <UserPlus size={15} className="text-[#5B73FF]" />
                </div>
                <div>
                  <h2 className="text-[15px] font-semibold text-white/90 leading-none">
                    Add Employee
                  </h2>
                  <p className="text-[11px] text-white/35 mt-0.5 leading-none">
                    Create a new team member account
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

            <form id="create-employee-form" onSubmit={handleSubmit} className="space-y-4">

              {/* ── Avatar preview ── */}
              <AvatarPreview name={formData.fullName} role={formData.role} />

              {/* ── Full name ── */}
              <InputField
                icon={User}
                label="Full Name"
                type="text"
                name="fullName"
                placeholder="e.g. Sara Ahmadi"
                value={formData.fullName}
                onChange={handleChange}
                autoFocus
              />

              {/* ── Email ── */}
              <InputField
                icon={Mail}
                label="Email Address"
                type="email"
                name="email"
                placeholder="sara@safarian.io"
                value={formData.email}
                onChange={handleChange}
              />

              {/* ── Password ── */}
              <div>
                <InputField
                  icon={Lock}
                  label="Password"
                  type={showPassword ? "text" : "password"}
                  name="password"
                  placeholder="Min. 6 characters"
                  value={formData.password}
                  onChange={handleChange}
                  rightEl={
                    <button
                      type="button"
                      onClick={() => setShowPassword((v) => !v)}
                      className="text-white/25 hover:text-white/60 transition-colors"
                      aria-label={showPassword ? "Hide password" : "Show password"}
                    >
                      {showPassword ? <EyeOff size={14} /> : <Eye size={14} />}
                    </button>
                  }
                />

                {/* Password strength bar */}
                {formData.password && passwordStrength && (
                  <motion.div
                    initial={{ opacity: 0, y: -4 }}
                    animate={{ opacity: 1,  y: 0  }}
                    className="mt-2"
                  >
                    <div className="flex items-center justify-between mb-1">
                      <span className="text-[10px] text-white/25">Password strength</span>
                      <span className={`text-[10px] font-medium ${
                        passwordStrength.label === "Weak"   ? "text-[#F43F5E]" :
                        passwordStrength.label === "Fair"   ? "text-[#F59E0B]" :
                        passwordStrength.label === "Good"   ? "text-[#5B73FF]" :
                        "text-[#22C97B]"
                      }`}>
                        {passwordStrength.label}
                      </span>
                    </div>
                    <div className="h-0.5 w-full bg-white/[0.06] rounded-full overflow-hidden">
                      <motion.div
                        initial={{ width: 0 }}
                        animate={{ width: passwordStrength.width }}
                        transition={{ duration: 0.3 }}
                        className={`h-full rounded-full ${passwordStrength.color}`}
                      />
                    </div>
                  </motion.div>
                )}
              </div>

              {/* ── Role selector ── */}
              <div>
                <label className="flex items-center gap-1.5 text-[11px] font-semibold text-white/40 uppercase tracking-widest mb-2">
                  <Shield size={11} className="text-white/25" />
                  Role
                </label>
                <div className="grid grid-cols-2 gap-2">
                  {ROLES.map((r) => {
                    const RIcon    = r.icon;
                    const isActive = formData.role === r.value;
                    return (
                      <button
                        key={r.value}
                        type="button"
                        onClick={() =>
                          setFormData((prev) => ({ ...prev, role: r.value }))
                        }
                        className={`
                          flex flex-col items-start gap-1
                          px-3 py-2.5 rounded-lg border
                          text-left transition-all duration-150
                          ${isActive
                            ? `${r.bg} ${r.border} ring-2 ${r.ring}`
                            : "bg-white/[0.02] border-white/[0.06] hover:bg-white/[0.05] hover:border-white/[0.10]"
                          }
                        `}
                      >
                        <div className="flex items-center gap-2">
                          <RIcon
                            size={13}
                            className={isActive ? r.color : "text-white/25"}
                          />
                          <span className={`text-[12px] font-semibold ${isActive ? r.color : "text-white/50"}`}>
                            {r.label}
                          </span>
                        </div>
                        <p className="text-[10px] text-white/25 leading-snug">
                          {r.description}
                        </p>
                      </button>
                    );
                  })}
                </div>
              </div>

              {/* ── Error ── */}
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
            </form>
          </div>

          {/* ── Footer ── */}
          <div className="px-6 pb-6 flex gap-2">
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
              form="create-employee-form"
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
                : status === "success" ? "Employee Added!"
                : (
                  <>
                    <UserPlus size={13} />
                    Add Employee
                  </>
                )
              }
            </button>
          </div>
        </motion.div>
      </motion.div>
    </AnimatePresence>
  );
};

export default CreateEmployeeModal;