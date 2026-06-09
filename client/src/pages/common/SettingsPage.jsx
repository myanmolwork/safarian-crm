import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  Lock,
  Eye,
  EyeOff,
  CheckCircle,
  AlertCircle,
  Loader2,
  ShieldCheck,
  KeyRound,
} from "lucide-react";
import DashboardLayout    from "../../layouts/DashboardLayout";
import { changePassword } from "../../services/profileService";

// ── Password strength ─────────────────────────────────────
const getStrength = (pwd) => {
  if (!pwd) return null;
  let score = 0;
  if (pwd.length >= 8)          score++;
  if (/[A-Z]/.test(pwd))        score++;
  if (/[0-9]/.test(pwd))        score++;
  if (/[^A-Za-z0-9]/.test(pwd)) score++;
  if (score <= 1) return { label: "Weak",   color: "bg-[#F43F5E]", text: "text-[#F43F5E]", width: "w-1/4"  };
  if (score === 2) return { label: "Fair",   color: "bg-[#F59E0B]", text: "text-[#F59E0B]", width: "w-2/4"  };
  if (score === 3) return { label: "Good",   color: "bg-[#5B73FF]", text: "text-[#5B73FF]", width: "w-3/4"  };
  return              { label: "Strong", color: "bg-[#22C97B]", text: "text-[#22C97B]", width: "w-full"  };
};

// ── Password input field ──────────────────────────────────
const PasswordField = ({ label, value, onChange, placeholder, strength }) => {
  const [show, setShow] = useState(false);
  return (
    <div className="space-y-2">
      <label className="block text-[11px] font-semibold text-white/40 uppercase tracking-widest">
        {label}
      </label>
      <div className="relative">
        <Lock
          size={14}
          className="absolute left-3 top-1/2 -translate-y-1/2 text-white/25 pointer-events-none"
        />
        <input
          type={show ? "text" : "password"}
          value={value}
          onChange={onChange}
          placeholder={placeholder}
          className="
            w-full h-10 pl-9 pr-10
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
        <button
          type="button"
          onClick={() => setShow((v) => !v)}
          className="
            absolute right-3 top-1/2 -translate-y-1/2
            text-white/25 hover:text-white/60
            transition-colors duration-150
          "
          aria-label={show ? "Hide password" : "Show password"}
        >
          {show ? <EyeOff size={14} /> : <Eye size={14} />}
        </button>
      </div>

      {/* Strength bar — only shown when strength prop passed */}
      {strength && value && (
        <motion.div
          initial={{ opacity: 0, y: -4 }}
          animate={{ opacity: 1, y: 0  }}
          className="space-y-1"
        >
          <div className="flex items-center justify-between">
            <span className="text-[10px] text-white/25">Password strength</span>
            <span className={`text-[10px] font-medium ${strength.text}`}>
              {strength.label}
            </span>
          </div>
          <div className="h-0.5 w-full bg-white/[0.06] rounded-full overflow-hidden">
            <motion.div
              initial={{ width: 0 }}
              animate={{ width: strength.width }}
              transition={{ duration: 0.3 }}
              className={`h-full rounded-full ${strength.color}`}
            />
          </div>
        </motion.div>
      )}
    </div>
  );
};

// ── SettingsPage ──────────────────────────────────────────
const SettingsPage = () => {
  const [formData, setFormData] = useState({
    currentPassword: "",
    newPassword:     "",
    confirmPassword: "",
  });
  const [status,   setStatus]   = useState("idle"); // idle | loading | success | error
  const [errorMsg, setErrorMsg] = useState("");

  const strength     = getStrength(formData.newPassword);
  const passwordsMatch = formData.confirmPassword
    ? formData.newPassword === formData.confirmPassword
    : null;

  const canSubmit =
    formData.currentPassword.trim() &&
    formData.newPassword.length >= 6  &&
    formData.newPassword === formData.confirmPassword &&
    status !== "loading" &&
    status !== "success";

  const handleChange = (field) => (e) =>
    setFormData((prev) => ({ ...prev, [field]: e.target.value }));

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!canSubmit) return;
    try {
      setStatus("loading");
      setErrorMsg("");
      await changePassword({
        currentPassword: formData.currentPassword,
        newPassword:     formData.newPassword,
      });
      setStatus("success");
      setFormData({ currentPassword: "", newPassword: "", confirmPassword: "" });
      setTimeout(() => setStatus("idle"), 3000);
    } catch (error) {
      setErrorMsg(error.response?.data?.message ?? "Failed to update password.");
      setStatus("error");
    }
  };

  return (
    <DashboardLayout>
      <div className="max-w-2xl mx-auto">

        {/* ── Page header ── */}
        <div className="mb-8">
          <p className="text-[11px] font-semibold text-white/30 uppercase tracking-widest mb-1">
            Account
          </p>
          <h1 className="text-[22px] font-semibold text-white/90 leading-tight">
            Security Settings
          </h1>
          <p className="text-[13px] text-white/35 mt-1">
            Manage your password and account security.
          </p>
        </div>

        {/* ── Change password card ── */}
        <div className="bg-[#1A1A24] border border-white/[0.07] rounded-xl overflow-hidden">
          {/* Card header */}
          <div className="flex items-center gap-3 px-6 py-4 border-b border-white/[0.05]">
            <div className="
              w-8 h-8 rounded-lg flex-shrink-0
              bg-[#5B73FF]/15
              flex items-center justify-center
            ">
              <KeyRound size={15} className="text-[#5B73FF]" />
            </div>
            <div>
              <h2 className="text-[14px] font-semibold text-white/90 leading-none">
                Change Password
              </h2>
              <p className="text-[12px] text-white/35 mt-0.5 leading-none">
                Choose a strong password to protect your account
              </p>
            </div>
          </div>

          {/* Form */}
          <form onSubmit={handleSubmit} className="px-6 py-5 space-y-5" noValidate>
            <PasswordField
              label="Current Password"
              value={formData.currentPassword}
              onChange={handleChange("currentPassword")}
              placeholder="Enter your current password"
            />

            <PasswordField
              label="New Password"
              value={formData.newPassword}
              onChange={handleChange("newPassword")}
              placeholder="Min. 6 characters"
              strength={strength}
            />

            {/* Confirm password with match indicator */}
            <div className="space-y-2">
              <label className="block text-[11px] font-semibold text-white/40 uppercase tracking-widest">
                Confirm New Password
              </label>
              <div className="relative">
                <Lock
                  size={14}
                  className="absolute left-3 top-1/2 -translate-y-1/2 text-white/25 pointer-events-none"
                />
                <input
                  type="password"
                  value={formData.confirmPassword}
                  onChange={handleChange("confirmPassword")}
                  placeholder="Repeat your new password"
                  className={`
                    w-full h-10 pl-9 pr-10
                    bg-[#111118] border rounded-lg
                    text-[13px] text-white/80
                    placeholder:text-white/20
                    outline-none transition-all duration-150
                    ${passwordsMatch === false
                      ? "border-[#F43F5E]/50 ring-2 ring-[#F43F5E]/10"
                      : passwordsMatch === true
                      ? "border-[#22C97B]/50 ring-2 ring-[#22C97B]/10"
                      : "border-white/[0.07] focus:border-[#5B73FF]/50 focus:ring-2 focus:ring-[#5B73FF]/10"
                    }
                  `}
                />
                {/* Match icon */}
                {passwordsMatch !== null && (
                  <div className="absolute right-3 top-1/2 -translate-y-1/2">
                    {passwordsMatch
                      ? <CheckCircle size={14} className="text-[#22C97B]" />
                      : <AlertCircle size={14} className="text-[#F43F5E]" />
                    }
                  </div>
                )}
              </div>

              {/* Mismatch hint */}
              <AnimatePresence>
                {passwordsMatch === false && (
                  <motion.p
                    initial={{ opacity: 0, height: 0     }}
                    animate={{ opacity: 1, height: "auto" }}
                    exit={{    opacity: 0, height: 0     }}
                    className="text-[11px] text-[#F43F5E] flex items-center gap-1 px-1"
                  >
                    <AlertCircle size={10} className="flex-shrink-0" />
                    Passwords do not match
                  </motion.p>
                )}
              </AnimatePresence>
            </div>

            {/* API error */}
            <AnimatePresence>
              {status === "error" && (
                <motion.div
                  initial={{ opacity: 0, height: 0     }}
                  animate={{ opacity: 1, height: "auto" }}
                  exit={{    opacity: 0, height: 0     }}
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

            {/* Success banner */}
            <AnimatePresence>
              {status === "success" && (
                <motion.div
                  initial={{ opacity: 0, height: 0     }}
                  animate={{ opacity: 1, height: "auto" }}
                  exit={{    opacity: 0, height: 0     }}
                  className="
                    flex items-center gap-2
                    px-3 py-2 rounded-lg
                    bg-[#22C97B]/10 border border-[#22C97B]/20
                    text-[#22C97B] text-[12px]
                  "
                >
                  <CheckCircle size={13} className="flex-shrink-0" />
                  Password updated successfully.
                </motion.div>
              )}
            </AnimatePresence>

            {/* Submit */}
            <div className="flex justify-end pt-1">
              <button
                type="submit"
                disabled={!canSubmit}
                className={`
                  flex items-center gap-2
                  h-9 px-5 rounded-lg
                  text-[13px] font-semibold
                  transition-all duration-200
                  ${status === "loading"
                    ? "bg-[#5B73FF]/60 text-white/60 cursor-not-allowed"
                    : canSubmit
                      ? "bg-[#5B73FF] hover:bg-[#4B63EE] text-white"
                      : "bg-white/[0.04] border border-white/[0.06] text-white/20 cursor-not-allowed"
                  }
                `}
              >
                {status === "loading" && <Loader2 size={13} className="animate-spin" />}
                {status === "success" && <CheckCircle size={13} />}
                {status === "loading" ? "Updating…"
                  : status === "success" ? "Updated!"
                  : (
                    <>
                      <ShieldCheck size={13} />
                      Update Password
                    </>
                  )
                }
              </button>
            </div>
          </form>
        </div>

        {/* ── Security tips ── */}
        <div className="
          mt-4 px-5 py-4 rounded-xl
          bg-white/[0.02] border border-white/[0.05]
        ">
          <p className="text-[11px] font-semibold text-white/30 uppercase tracking-widest mb-2">
            Password tips
          </p>
          <ul className="space-y-1">
            {[
              "Use at least 8 characters",
              "Include uppercase and lowercase letters",
              "Add numbers and special characters (!@#$)",
              "Don't reuse passwords from other accounts",
            ].map((tip) => (
              <li key={tip} className="flex items-center gap-2 text-[12px] text-white/30">
                <span className="w-1 h-1 rounded-full bg-white/20 flex-shrink-0" />
                {tip}
              </li>
            ))}
          </ul>
        </div>

      </div>
    </DashboardLayout>
  );
};

export default SettingsPage;