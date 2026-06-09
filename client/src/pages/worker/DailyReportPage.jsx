import { useState }       from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  CheckCircle,
  AlertCircle,
  Loader2,
  ClipboardList,
  Zap,
  AlertTriangle,
  CalendarDays,
  Send,
} from "lucide-react";
import DashboardLayout  from "../../layouts/DashboardLayout";
import { submitReport } from "../../services/reportService";
import useAuthStore     from "../../store/authStore";

// ── Character counter ─────────────────────────────────────
const CharCount = ({ value, max }) => {
  const count = value?.length ?? 0;
  const near  = count >= max * 0.85;
  const over  = count >= max;
  return (
    <span className={`
      text-[11px] tabular-nums
      ${over ? "text-[#F43F5E]" : near ? "text-[#F59E0B]" : "text-white/20"}
    `}>
      {count}/{max}
    </span>
  );
};

// ── Textarea field ────────────────────────────────────────
const ReportField = ({
  label, name, value, onChange,
  rows = 4, required, placeholder,
  icon: Icon, hint, maxLength,
}) => (
  <div className="space-y-2">
    {/* Label row */}
    <div className="flex items-center justify-between">
      <label className="flex items-center gap-2 text-[12px] font-semibold text-white/50 uppercase tracking-widest">
        {Icon && <Icon size={12} className="text-white/30" />}
        {label}
        {required && <span className="text-[#F43F5E] text-[10px]">required</span>}
      </label>
      {maxLength && <CharCount value={value} max={maxLength} />}
    </div>

    {/* Textarea */}
    <textarea
      name={name}
      value={value}
      onChange={onChange}
      rows={rows}
      maxLength={maxLength}
      placeholder={placeholder}
      required={required}
      className="
        w-full px-4 py-3
        bg-[#111118] border border-white/[0.07]
        rounded-xl resize-none
        text-[13px] text-white/80
        placeholder:text-white/15
        leading-relaxed
        outline-none
        focus:border-[#5B73FF]/50
        focus:ring-2 focus:ring-[#5B73FF]/10
        transition-all duration-150
      "
    />

    {/* Hint */}
    {hint && (
      <p className="text-[11px] text-white/25 px-1">{hint}</p>
    )}
  </div>
);

// ── DailyReportPage ───────────────────────────────────────
const DailyReportPage = () => {
  const user = useAuthStore((state) => state.user);

  const [formData, setFormData] = useState({
    workDone:     "",
    blockers:     "",
    tomorrowPlan: "",
  });
  const [status,   setStatus]   = useState("idle"); // idle | loading | success | error
  const [errorMsg, setErrorMsg] = useState("");

  const canSubmit = formData.workDone.trim().length > 0 && status !== "loading" && status !== "success";

  const today = new Date().toLocaleDateString("en-US", {
    weekday: "long", month: "long", day: "numeric",
  });

  const handleChange = (e) =>
    setFormData((prev) => ({ ...prev, [e.target.name]: e.target.value }));

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!canSubmit) return;
    try {
      setStatus("loading");
      setErrorMsg("");
      await submitReport(formData);
      setStatus("success");
    } catch (error) {
      setErrorMsg(error.response?.data?.message ?? "Failed to submit report. Please try again.");
      setStatus("error");
    }
  };

  const handleReset = () => {
    setFormData({ workDone: "", blockers: "", tomorrowPlan: "" });
    setStatus("idle");
    setErrorMsg("");
  };

  return (
    <DashboardLayout>
      <div className="max-w-2xl mx-auto">

        {/* ── Page header ── */}
        <div className="flex items-start justify-between mb-8">
          <div>
            <p className="text-[11px] font-semibold text-white/30 uppercase tracking-widest mb-1">
              Daily Report
            </p>
            <h1 className="text-[22px] font-semibold text-white/90 leading-tight">
              End of Day Summary
            </h1>
            <p className="text-[13px] text-white/35 mt-1">
              Share your progress with your team leader.
            </p>
          </div>

          {/* Date badge */}
          <div className="
            hidden sm:flex items-center gap-2
            px-3 py-2 rounded-lg
            bg-[#1A1A24] border border-white/[0.07]
            text-[12px] text-white/40
          ">
            <CalendarDays size={13} className="text-white/25" />
            {today}
          </div>
        </div>

        {/* ── Success state ── */}
        <AnimatePresence mode="wait">
          {status === "success" ? (
            <motion.div
              key="success"
              initial={{ opacity: 0, scale: 0.97, y: 8  }}
              animate={{ opacity: 1, scale: 1,    y: 0  }}
              exit={{    opacity: 0, scale: 0.97, y: -8 }}
              transition={{ duration: 0.25, ease: [0.16, 1, 0.3, 1] }}
              className="
                flex flex-col items-center justify-center
                bg-[#1A1A24] border border-white/[0.07]
                rounded-2xl px-8 py-16 text-center
              "
            >
              {/* Top accent */}
              <div className="h-px w-full absolute top-0 left-0 bg-gradient-to-r from-transparent via-[#22C97B]/50 to-transparent rounded-t-2xl" />

              <div className="
                w-14 h-14 rounded-2xl mb-5
                bg-[#22C97B]/15 border border-[#22C97B]/25
                flex items-center justify-center
              ">
                <CheckCircle size={28} className="text-[#22C97B]" />
              </div>

              <h2 className="text-[18px] font-semibold text-white/90 mb-2">
                Report submitted!
              </h2>
              <p className="text-[13px] text-white/40 max-w-xs leading-relaxed mb-8">
                Your daily report has been sent to your team leader. Great work today.
              </p>

              <button
                onClick={handleReset}
                className="
                  h-9 px-5 rounded-lg
                  bg-white/[0.05] hover:bg-white/[0.08]
                  border border-white/[0.07]
                  text-[12px] font-medium text-white/50 hover:text-white/80
                  transition-all duration-150
                "
              >
                Submit another report
              </button>
            </motion.div>

          ) : (

            /* ── Form ── */
            <motion.div
              key="form"
              initial={{ opacity: 0, y: 8  }}
              animate={{ opacity: 1, y: 0  }}
              exit={{    opacity: 0, y: -8 }}
              transition={{ duration: 0.2 }}
            >
              <div className="
                bg-[#1A1A24] border border-white/[0.07]
                rounded-2xl overflow-hidden
              ">
                {/* Top accent line */}
                <div className="h-px w-full bg-gradient-to-r from-transparent via-[#5B73FF]/40 to-transparent" />

                <form
                  onSubmit={handleSubmit}
                  noValidate
                  className="p-6 space-y-6"
                >
                  {/* Work Done */}
                  <ReportField
                    label="Work Done Today"
                    name="workDone"
                    value={formData.workDone}
                    onChange={handleChange}
                    rows={5}
                    required
                    maxLength={1000}
                    icon={Zap}
                    placeholder="Describe the tasks you completed, features built, or progress made today..."
                    hint="Be specific — your team leader uses this to track progress."
                  />

                  {/* Divider */}
                  <div className="border-t border-white/[0.05]" />

                  {/* Blockers */}
                  <ReportField
                    label="Blockers / Challenges"
                    name="blockers"
                    value={formData.blockers}
                    onChange={handleChange}
                    rows={3}
                    maxLength={500}
                    icon={AlertTriangle}
                    placeholder="Any obstacles, dependencies, or issues that slowed you down? (optional)"
                    hint="Leave blank if you had no blockers today."
                  />

                  {/* Divider */}
                  <div className="border-t border-white/[0.05]" />

                  {/* Tomorrow's Plan */}
                  <ReportField
                    label="Tomorrow's Plan"
                    name="tomorrowPlan"
                    value={formData.tomorrowPlan}
                    onChange={handleChange}
                    rows={3}
                    maxLength={500}
                    icon={CalendarDays}
                    placeholder="What are your priorities for tomorrow? (optional)"
                  />

                  {/* ── Error banner ── */}
                  <AnimatePresence>
                    {status === "error" && (
                      <motion.div
                        initial={{ opacity: 0, height: 0     }}
                        animate={{ opacity: 1, height: "auto" }}
                        exit={{    opacity: 0, height: 0     }}
                        className="
                          flex items-center gap-2
                          px-3 py-2.5 rounded-lg
                          bg-[#F43F5E]/10 border border-[#F43F5E]/20
                          text-[#F43F5E] text-[12px]
                        "
                      >
                        <AlertCircle size={13} className="flex-shrink-0" />
                        {errorMsg}
                      </motion.div>
                    )}
                  </AnimatePresence>

                  {/* ── Footer: meta + submit ── */}
                  <div className="
                    flex items-center justify-between
                    pt-2 border-t border-white/[0.05]
                  ">
                    {/* Reporter info */}
                    <div className="flex items-center gap-2">
                      <div className="
                        w-6 h-6 rounded-full
                        bg-[#5B73FF]/20 text-[#5B73FF]
                        flex items-center justify-center
                        text-[10px] font-bold flex-shrink-0
                      ">
                        {user?.name
                          ? user.name.split(" ").map((n) => n[0]).join("").slice(0, 2).toUpperCase()
                          : "??"
                        }
                      </div>
                      <span className="text-[12px] text-white/30">
                        {user?.name ?? "You"} · {today}
                      </span>
                    </div>

                    {/* Submit button */}
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
                      {status === "loading"
                        ? <><Loader2 size={13} className="animate-spin" /> Submitting…</>
                        : <><Send size={13} /> Submit Report</>
                      }
                    </button>
                  </div>
                </form>
              </div>

              {/* Tips strip */}
              <div className="
                flex items-start gap-3
                mt-4 px-4 py-3 rounded-xl
                bg-white/[0.02] border border-white/[0.05]
              ">
                <ClipboardList size={14} className="text-white/20 mt-0.5 flex-shrink-0" />
                <p className="text-[11px] text-white/25 leading-relaxed">
                  <span className="text-white/40 font-medium">Tip:</span> Submit your report before end of business. Your team leader reviews all reports daily.
                </p>
              </div>
            </motion.div>
          )}
        </AnimatePresence>

      </div>
    </DashboardLayout>
  );
};

export default DailyReportPage;