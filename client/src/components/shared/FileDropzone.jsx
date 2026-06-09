import { useState, useCallback } from "react";
import { useDropzone }           from "react-dropzone";
import { motion, AnimatePresence } from "framer-motion";
import {
  Upload,
  FileText,
  FileImage,
  FileVideo,
  FileArchive,
  File,
  X,
  CheckCircle,
} from "lucide-react";

// ── File type helpers ─────────────────────────────────────
const getFileIcon = (file) => {
  const type = file.type ?? "";
  if (type.startsWith("image/"))  return { icon: FileImage,   color: "text-[#5B73FF]",  bg: "bg-[#5B73FF]/10"  };
  if (type.startsWith("video/"))  return { icon: FileVideo,   color: "text-[#A78BFA]",  bg: "bg-[#A78BFA]/10"  };
  if (type.includes("pdf"))       return { icon: FileText,    color: "text-[#F43F5E]",  bg: "bg-[#F43F5E]/10"  };
  if (type.includes("zip") ||
      type.includes("rar") ||
      type.includes("tar"))       return { icon: FileArchive, color: "text-[#F59E0B]",  bg: "bg-[#F59E0B]/10"  };
  if (type.includes("sheet") ||
      type.includes("excel") ||
      type.includes("csv"))       return { icon: FileText,    color: "text-[#22C97B]",  bg: "bg-[#22C97B]/10"  };
  return                                 { icon: File,         color: "text-white/40",   bg: "bg-white/[0.06]"  };
};

const formatBytes = (bytes) => {
  if (bytes === 0) return "0 B";
  const k     = 1024;
  const sizes = ["B", "KB", "MB", "GB"];
  const i     = Math.floor(Math.log(bytes) / Math.log(k));
  return `${parseFloat((bytes / Math.pow(k, i)).toFixed(1))} ${sizes[i]}`;
};

// ── Accepted file types label ─────────────────────────────
const ACCEPTED_LABEL = "PDF, images, videos, ZIP, Excel — max 20 MB";

// ── FileDropzone ──────────────────────────────────────────
// Props:
//   onFileSelect  — (file: File) => void
//   accept        — react-dropzone accept object (optional)
//   maxSize       — bytes (default 20 MB)
//   label         — override helper text
const FileDropzone = ({
  onFileSelect,
  accept,
  maxSize = 20 * 1024 * 1024,
  label   = ACCEPTED_LABEL,
}) => {
  const [file,     setFile]     = useState(null);
  const [error,    setError]    = useState("");

  const onDrop = useCallback((accepted, rejected) => {
    setError("");
    if (rejected?.length) {
      const reason = rejected[0]?.errors?.[0]?.code;
      if (reason === "file-too-large") {
        setError(`File exceeds the ${formatBytes(maxSize)} limit.`);
      } else if (reason === "file-invalid-type") {
        setError("This file type isn't supported.");
      } else {
        setError("File couldn't be added. Please try again.");
      }
      return;
    }
    if (accepted?.length) {
      const selected = accepted[0];
      setFile(selected);
      onFileSelect(selected);
    }
  }, [onFileSelect, maxSize]);

  const handleRemove = (e) => {
    e.stopPropagation();
    setFile(null);
    setError("");
    onFileSelect(null);
  };

  const {
    getRootProps,
    getInputProps,
    isDragActive,
    isDragReject,
  } = useDropzone({
    multiple: false,
    maxSize,
    accept,
    onDrop,
  });

  const fileConfig = file ? getFileIcon(file) : null;
  const FileIcon   = fileConfig?.icon ?? File;

  return (
    <div className="space-y-2">
      <div
        {...getRootProps()}
        className={`
          relative
          flex flex-col items-center justify-center
          w-full rounded-xl
          border border-dashed
          cursor-pointer
          transition-all duration-200
          outline-none
          ${file
            ? "p-4 border-[#22C97B]/30 bg-[#22C97B]/[0.04]"
            : isDragReject
            ? "p-8 border-[#F43F5E]/40 bg-[#F43F5E]/[0.05]"
            : isDragActive
            ? "p-8 border-[#5B73FF]/50 bg-[#5B73FF]/[0.06] scale-[1.01]"
            : "p-8 border-white/[0.10] bg-white/[0.02] hover:border-white/[0.20] hover:bg-white/[0.04]"
          }
        `}
      >
        <input {...getInputProps()} />

        <AnimatePresence mode="wait">

          {/* ── File selected state ── */}
          {file ? (
            <motion.div
              key="file"
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1    }}
              exit={{    opacity: 0, scale: 0.95 }}
              transition={{ duration: 0.15 }}
              className="flex items-center gap-3 w-full"
            >
              {/* File icon badge */}
              <div className={`
                flex items-center justify-center
                w-9 h-9 rounded-lg flex-shrink-0
                ${fileConfig?.bg}
              `}>
                <FileIcon size={18} className={fileConfig?.color} />
              </div>

              {/* File info */}
              <div className="flex-1 min-w-0">
                <p className="text-[13px] font-medium text-white/80 truncate leading-none">
                  {file.name}
                </p>
                <p className="text-[11px] text-white/30 mt-0.5 leading-none">
                  {formatBytes(file.size)}
                </p>
              </div>

              {/* Success check */}
              <CheckCircle size={15} className="text-[#22C97B] flex-shrink-0" />

              {/* Remove */}
              <button
                onClick={handleRemove}
                aria-label="Remove file"
                className="
                  flex items-center justify-center
                  w-6 h-6 rounded-md flex-shrink-0
                  text-white/25 hover:text-[#F43F5E]
                  hover:bg-[#F43F5E]/10
                  transition-colors duration-150
                "
              >
                <X size={13} />
              </button>
            </motion.div>

          ) : isDragReject ? (
            /* ── Reject state ── */
            <motion.div
              key="reject"
              initial={{ opacity: 0, y: 4  }}
              animate={{ opacity: 1, y: 0  }}
              exit={{    opacity: 0, y: -4 }}
              transition={{ duration: 0.15 }}
              className="flex flex-col items-center gap-2"
            >
              <div className="w-10 h-10 rounded-xl bg-[#F43F5E]/10 border border-[#F43F5E]/20 flex items-center justify-center">
                <X size={18} className="text-[#F43F5E]" />
              </div>
              <p className="text-[13px] font-medium text-[#F43F5E]">
                File not supported
              </p>
            </motion.div>

          ) : isDragActive ? (
            /* ── Drag active state ── */
            <motion.div
              key="active"
              initial={{ opacity: 0, y: 4  }}
              animate={{ opacity: 1, y: 0  }}
              exit={{    opacity: 0, y: -4 }}
              transition={{ duration: 0.15 }}
              className="flex flex-col items-center gap-2"
            >
              <motion.div
                animate={{ y: [0, -4, 0] }}
                transition={{ duration: 0.8, repeat: Infinity, ease: "easeInOut" }}
                className="w-10 h-10 rounded-xl bg-[#5B73FF]/15 border border-[#5B73FF]/25 flex items-center justify-center"
              >
                <Upload size={18} className="text-[#5B73FF]" />
              </motion.div>
              <p className="text-[13px] font-semibold text-[#5B73FF]">
                Drop to upload
              </p>
            </motion.div>

          ) : (
            /* ── Idle state ── */
            <motion.div
              key="idle"
              initial={{ opacity: 0, y: 4  }}
              animate={{ opacity: 1, y: 0  }}
              exit={{    opacity: 0, y: -4 }}
              transition={{ duration: 0.15 }}
              className="flex flex-col items-center gap-3"
            >
              <div className="
                w-10 h-10 rounded-xl
                bg-white/[0.04] border border-white/[0.08]
                flex items-center justify-center
              ">
                <Upload size={18} className="text-white/30" />
              </div>
              <div className="text-center">
                <p className="text-[13px] font-medium text-white/60">
                  Drop file here or{" "}
                  <span className="text-[#5B73FF] underline underline-offset-2">
                    browse
                  </span>
                </p>
                <p className="text-[11px] text-white/25 mt-1">
                  {label}
                </p>
              </div>
            </motion.div>
          )}

        </AnimatePresence>
      </div>

      {/* ── Error message ── */}
      <AnimatePresence>
        {error && (
          <motion.p
            initial={{ opacity: 0, height: 0  }}
            animate={{ opacity: 1, height: "auto" }}
            exit={{    opacity: 0, height: 0  }}
            className="
              flex items-center gap-1.5
              text-[12px] text-[#F43F5E]
              px-1
            "
          >
            <X size={11} className="flex-shrink-0" />
            {error}
          </motion.p>
        )}
      </AnimatePresence>
    </div>
  );
};

export default FileDropzone;