import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { X, Upload, CheckCircle, AlertCircle } from "lucide-react";
import FileDropzone from "../shared/FileDropzone";
import { createSubmission } from "../../services/submissionService";

// ── Status states: idle | loading | success | error ──────
const SubmissionModal = ({ taskId, onClose, refetch }) => {
  const [file,    setFile]   = useState(null);
  const [comment, setComment] = useState("");
  const [status,  setStatus]  = useState("idle"); // idle | loading | success | error
  const [errorMsg, setErrorMsg] = useState("");

  const canSubmit = file && status !== "loading" && status !== "success";

  const handleSubmit = async () => {
    if (!canSubmit) return;
    try {
      setStatus("loading");
      setErrorMsg("");
      const formData = new FormData();
      formData.append("file",   file);
      formData.append("taskId", taskId);
      formData.append("message", comment);
      await createSubmission(formData);
      setStatus("success");
      await refetch?.();
      // Auto-close after success flash
      setTimeout(onClose, 1200);
    } catch (error) {
      setErrorMsg(error.response?.data?.message ?? "Something went wrong.");
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
        {/* ── Modal panel ── */}
        <motion.div
          key="modal"
          initial={{ opacity: 0, scale: 0.96, y: 12 }}
          animate={{ opacity: 1, scale: 1,    y: 0  }}
          exit={{    opacity: 0, scale: 0.96, y: 8  }}
          transition={{ duration: 0.2, ease: [0.16, 1, 0.3, 1] }}
          onClick={(e) => e.stopPropagation()}
          className="
            relative w-full max-w-md
            bg-[#1A1A24]
            border border-white/[0.08]
            rounded-2xl
            overflow-hidden
          "
        >
          {/* ── Top accent line ── */}
          <div className="h-px w-full bg-gradient-to-r from-transparent via-[#5B73FF]/50 to-transparent" />

          <div className="p-6">
            {/* ── Header ── */}
            <div className="flex items-center justify-between mb-6">
              <div>
                <h2 className="text-[15px] font-semibold text-white/90">
                  Submit Work
                </h2>
                <p className="text-[12px] text-white/35 mt-0.5">
                  Attach your file and leave a note for your reviewer.
                </p>
              </div>
              <button
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

            {/* ── File dropzone ── */}
            <div className="mb-4">
              <label className="block text-[11px] font-medium text-white/40 uppercase tracking-widest mb-2">
                Attachment
              </label>
              <FileDropzone onFileSelect={setFile} />

              {/* Selected file pill */}
              {file && (
                <motion.div
                  initial={{ opacity: 0, y: 4 }}
                  animate={{ opacity: 1, y: 0 }}
                  className="
                    flex items-center justify-between
                    mt-2 px-3 py-2 rounded-lg
                    bg-[#5B73FF]/10 border border-[#5B73FF]/20
                  "
                >
                  <span className="text-[12px] text-[#5B73FF] truncate">
                    {file.name}
                  </span>
                  <button
                    onClick={() => setFile(null)}
                    className="text-white/30 hover:text-white/60 ml-2 flex-shrink-0 transition-colors"
                    aria-label="Remove file"
                  >
                    <X size={12} />
                  </button>
                </motion.div>
              )}
            </div>

            {/* ── Comment textarea ── */}
            <div className="mb-5">
              <label className="block text-[11px] font-medium text-white/40 uppercase tracking-widest mb-2">
                Notes <span className="normal-case tracking-normal text-white/20">(optional)</span>
              </label>
              <textarea
                placeholder="Describe what you've done, any blockers, or notes for the reviewer..."
                value={comment}
                onChange={(e) => setComment(e.target.value)}
                rows={3}
                className="
                  w-full px-3 py-2.5
                  bg-[#111118] border border-white/[0.07]
                  rounded-xl
                  text-[13px] text-white/80 placeholder:text-white/20
                  outline-none resize-none
                  focus:border-[#5B73FF]/50 focus:ring-2 focus:ring-[#5B73FF]/10
                  transition-all duration-150
                "
              />
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
                    px-3 py-2 mb-4 rounded-lg
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
            <div className="flex gap-2">
              <button
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
                onClick={handleSubmit}
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
                  <svg
                    className="animate-spin w-3.5 h-3.5 text-white"
                    viewBox="0 0 24 24" fill="none"
                  >
                    <circle cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="3" strokeOpacity="0.25" />
                    <path d="M12 2a10 10 0 0 1 10 10" stroke="currentColor" strokeWidth="3" strokeLinecap="round" />
                  </svg>
                )}
                {status === "success" && <CheckCircle size={14} />}
                {status === "loading" ? "Submitting…"
                  : status === "success" ? "Submitted!"
                  : (
                    <>
                      <Upload size={13} />
                      Submit
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

export default SubmissionModal;