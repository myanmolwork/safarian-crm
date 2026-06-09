import { useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import { useNavigate } from "react-router-dom";
import { motion, AnimatePresence } from "framer-motion";
import {
  Mail,
  Lock,
  Eye,
  EyeOff,
  AlertCircle,
  Loader2,
  Briefcase,
  ArrowRight,
} from "lucide-react";
import { loginUser }   from "../../services/authService";
import useAuthStore    from "../../store/authStore";
import { checkIn } from "../../services/attendanceService";
// ── Validation schema ─────────────────────────────────────
const loginSchema = z.object({
  email:    z.string().email("Enter a valid email address"),
  password: z.string().min(6, "Password must be at least 6 characters"),
});

// ── Field wrapper ─────────────────────────────────────────
const Field = ({ icon: Icon, error, children }) => (
  <div className="space-y-1.5">
    <div className={`
      relative flex items-center
      bg-[#111118] border rounded-lg
      transition-all duration-150
      ${error
        ? "border-[#F43F5E]/50 ring-2 ring-[#F43F5E]/10"
        : "border-white/[0.07] focus-within:border-[#5B73FF]/50 focus-within:ring-2 focus-within:ring-[#5B73FF]/10"
      }
    `}>
      <Icon
        size={15}
        className="absolute left-3 text-white/25 pointer-events-none flex-shrink-0"
      />
      {children}
    </div>

    <AnimatePresence>
      {error && (
        <motion.p
          initial={{ opacity: 0, y: -4, height: 0   }}
          animate={{ opacity: 1, y: 0,  height: "auto" }}
          exit={{    opacity: 0, y: -4, height: 0   }}
          transition={{ duration: 0.15 }}
          className="flex items-center gap-1.5 text-[11px] text-[#F43F5E] px-1"
        >
          <AlertCircle size={11} className="flex-shrink-0" />
          {error}
        </motion.p>
      )}
    </AnimatePresence>
  </div>
);

// ── LoginPage ─────────────────────────────────────────────
const LoginPage = () => {
  const navigate      = useNavigate();
  const { setAuth }   = useAuthStore();
  const [showPwd,  setShowPwd]  = useState(false);
  const [apiError, setApiError] = useState("");
  const [loading,  setLoading]  = useState(false);

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm({ resolver: zodResolver(loginSchema) });

  const onSubmit = async (data) => {
    try {
      setLoading(true);
      setApiError("");
      const response = await loginUser(data);

setAuth(
  response.data.user,
  response.data.token
);

// Auto attendance for workers & leaders
if (
  response.data.user.role === "WORKER" ||
  response.data.user.role === "TEAM_LEADER"
) {
  try {
    await checkIn();
  } catch (err) {
  console.log(
    "Attendance Error:",
    err.response?.data || err.message
  );
}
}

navigate("/");
    } catch (error) {
      setApiError(error.response?.data?.message ?? "Invalid credentials. Please try again.");
      setLoading(false);
    }
  };

  return (
    <div className="
      min-h-screen
      bg-[#0A0A0F]
      flex items-center justify-center
      px-4 py-12
    ">
      {/* ── Subtle background glow ── */}
      <div className="
        pointer-events-none fixed inset-0 z-0
        flex items-center justify-center
      ">
        <div className="
          w-[600px] h-[600px] rounded-full
          bg-[#5B73FF]/[0.04]
          blur-[120px]
        " />
      </div>

      <motion.div
        initial={{ opacity: 0, y: 16 }}
        animate={{ opacity: 1, y: 0  }}
        transition={{ duration: 0.3, ease: [0.16, 1, 0.3, 1] }}
        className="relative z-10 w-full max-w-sm"
      >
        {/* ── Card ── */}
        <div className="
          bg-[#1A1A24]
          border border-white/[0.08]
          rounded-2xl
          overflow-hidden
        ">
          {/* Top accent line */}
          <div className="h-px w-full bg-gradient-to-r from-transparent via-[#5B73FF]/60 to-transparent" />

          <div className="px-8 py-8">
            {/* ── Brand ── */}
            <div className="flex flex-col items-center mb-8">
              <div className="
                flex items-center justify-center
                w-11 h-11 rounded-xl
                bg-[#5B73FF] mb-4
                shadow-lg shadow-[#5B73FF]/25
              ">
                <Briefcase size={20} className="text-white" />
              </div>
              <h1 className="text-[20px] font-semibold text-white/90 leading-none">
                Safarian CRM
              </h1>
              <p className="text-[13px] text-white/35 mt-1.5">
                Sign in to your workspace
              </p>
            </div>

            {/* ── Form ── */}
            <form
              onSubmit={handleSubmit(onSubmit)}
              className="space-y-4"
              noValidate
            >
              {/* Email */}
              <Field icon={Mail} error={errors.email?.message}>
                <input
                  type="email"
                  placeholder="Email address"
                  autoComplete="email"
                  autoFocus
                  {...register("email")}
                  className="
                    w-full h-10 pl-9 pr-3
                    bg-transparent outline-none
                    text-[13px] text-white/80
                    placeholder:text-white/20
                  "
                />
              </Field>

              {/* Password */}
              <Field icon={Lock} error={errors.password?.message}>
                <input
                  type={showPwd ? "text" : "password"}
                  placeholder="Password"
                  autoComplete="current-password"
                  {...register("password")}
                  className="
                    w-full h-10 pl-9 pr-10
                    bg-transparent outline-none
                    text-[13px] text-white/80
                    placeholder:text-white/20
                  "
                />
                <button
                  type="button"
                  onClick={() => setShowPwd((v) => !v)}
                  aria-label={showPwd ? "Hide password" : "Show password"}
                  className="
                    absolute right-3
                    text-white/25 hover:text-white/60
                    transition-colors duration-150
                  "
                >
                  {showPwd ? <EyeOff size={15} /> : <Eye size={15} />}
                </button>
              </Field>

              {/* ── API error ── */}
              <AnimatePresence>
                {apiError && (
                  <motion.div
                    initial={{ opacity: 0, height: 0    }}
                    animate={{ opacity: 1, height: "auto" }}
                    exit={{    opacity: 0, height: 0    }}
                    className="
                      flex items-center gap-2
                      px-3 py-2 rounded-lg
                      bg-[#F43F5E]/10 border border-[#F43F5E]/20
                      text-[#F43F5E] text-[12px]
                    "
                  >
                    <AlertCircle size={13} className="flex-shrink-0" />
                    {apiError}
                  </motion.div>
                )}
              </AnimatePresence>

              {/* ── Submit ── */}
              <button
                type="submit"
                disabled={loading}
                className={`
                  w-full h-10 rounded-lg mt-2
                  flex items-center justify-center gap-2
                  text-[13px] font-semibold
                  transition-all duration-200
                  ${loading
                    ? "bg-[#5B73FF]/60 cursor-not-allowed text-white/60"
                    : "bg-[#5B73FF] hover:bg-[#4B63EE] text-white"
                  }
                `}
              >
                {loading
                  ? <Loader2 size={15} className="animate-spin" />
                  : (
                    <>
                      Sign In
                      <ArrowRight size={14} />
                    </>
                  )
                }
              </button>
            </form>
          </div>
        </div>

        {/* ── Footer ── */}
        <p className="text-center text-[11px] text-white/20 mt-5">
          Safarian CRM · Secure workspace login
        </p>
      </motion.div>
    </div>
  );
};

export default LoginPage;