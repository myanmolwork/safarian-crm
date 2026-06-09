import { useState, useMemo, useCallback } from "react";
import { useQuery, useQueryClient }       from "@tanstack/react-query";
import { motion, AnimatePresence }        from "framer-motion";
import {
  FileText,
  CheckCircle,
  RefreshCw,
  ExternalLink,
  Paperclip,
  Filter,
  Search,
  Clock,
  AlertCircle,
  Loader2,
} from "lucide-react";                          // ✅ removed Download (unused)
import DashboardLayout    from "../../layouts/DashboardLayout";
import Loader             from "../../components/shared/Loader";
import EmptyState         from "../../components/shared/EmptyState";
                                                // ✅ removed StatusBadge (unused)
import {
  getSubmissions,
  reviewSubmission,
} from "../../services/submissionService";

// ── Helpers ───────────────────────────────────────────────
const getRelativeTime = (date) => {
  const diff = Math.floor((Date.now() - new Date(date)) / 1000);
  if (diff < 60)    return "just now";
  if (diff < 3600)  return `${Math.floor(diff / 60)}m ago`;
  if (diff < 86400) return `${Math.floor(diff / 3600)}h ago`;
  return new Date(date).toLocaleDateString("en-US", {
    month: "short", day: "numeric",
  });
};

const getInitials = (name) =>
  name
    ? name.split(" ").map((n) => n[0]).join("").slice(0, 2).toUpperCase()
    : "??";

// ── Status config ─────────────────────────────────────────
const SUBMISSION_STATUS = {
  PENDING: {
    label:  "Pending",
    color:  "text-[#F59E0B]",
    bg:     "bg-[#F59E0B]/10",
    border: "border-[#F59E0B]/20",
    dot:    "bg-[#F59E0B]",
  },
  APPROVED: {
    label:  "Approved",
    color:  "text-[#22C97B]",
    bg:     "bg-[#22C97B]/10",
    border: "border-[#22C97B]/20",
    dot:    "bg-[#22C97B]",
  },
  REVISION_REQUIRED: {
    label:  "Revision",
    color:  "text-[#F43F5E]",
    bg:     "bg-[#F43F5E]/10",
    border: "border-[#F43F5E]/20",
    dot:    "bg-[#F43F5E]",
  },
};

const SubmissionStatusBadge = ({ status }) => {
  const config = SUBMISSION_STATUS[status] ?? SUBMISSION_STATUS.PENDING;
  return (
    <span className={`
      inline-flex items-center gap-1.5
      px-2 py-0.5 rounded-md
      text-[11px] font-semibold border
      ${config.color} ${config.bg} ${config.border}
    `}>
      <span className={`w-1.5 h-1.5 rounded-full ${config.dot}`} />
      {config.label}
    </span>
  );
};

// ── Filter tab ────────────────────────────────────────────
const FilterTab = ({ active, onClick, children }) => (
  <button
    onClick={onClick}
    className={`
      px-3 py-1.5 rounded-lg text-[12px] font-medium
      transition-all duration-150 whitespace-nowrap
      ${active
        ? "bg-[#5B73FF]/15 text-[#5B73FF]"
        : "text-white/30 hover:text-white/60 hover:bg-white/[0.05]"
      }
    `}
  >
    {children}
  </button>
);

// ── Submission card ───────────────────────────────────────
const SubmissionCard = ({ submission, onReview }) => {
  const [actionLoading, setActionLoading] = useState(null);
  const [localStatus,   setLocalStatus]   = useState(submission.status ?? "PENDING");

  const fileUrl  = submission.files?.[0]?.url;
  const fileName = submission.files?.[0]?.name ?? "Attachment";
  const name     = submission.submittedBy?.fullName ?? "Unknown";
  const isDone   = localStatus === "APPROVED" || localStatus === "REVISION_REQUIRED";

  const handleAction = async (status) => {
    if (actionLoading || isDone) return;
    try {
      setActionLoading(status);
      await onReview(submission._id, status);
      setLocalStatus(status);
    } finally {
      setActionLoading(null);
    }
  };

  return (
    <motion.div
      layout
      initial={{ opacity: 0, y: 8   }}
      animate={{ opacity: 1, y: 0   }}
      exit={{    opacity: 0, y: -4, scale: 0.98 }}
      transition={{ duration: 0.18, ease: "easeOut" }}
      className={`
        bg-[#1A1A24] border rounded-xl overflow-hidden
        transition-colors duration-150
        ${localStatus === "APPROVED"
          ? "border-[#22C97B]/20"
          : localStatus === "REVISION_REQUIRED"
          ? "border-[#F43F5E]/20"
          : "border-white/[0.07] hover:border-white/[0.12]"
        }
      `}
    >
      {/* ── Card header ── */}
      <div className="flex items-start gap-3 px-5 py-4 border-b border-white/[0.05]">
        <div className="
          w-9 h-9 rounded-xl flex-shrink-0
          bg-[#5B73FF]/10 border border-[#5B73FF]/15
          flex items-center justify-center
        ">
          <FileText size={15} className="text-[#5B73FF]" />
        </div>

        <div className="flex-1 min-w-0">
          <p className="text-[14px] font-semibold text-white/90 leading-none truncate">
            {submission.taskId?.title ?? "Untitled Task"}
          </p>
          <div className="flex items-center gap-2 mt-1.5">
            <div className="
              w-4 h-4 rounded-full flex-shrink-0
              bg-[#5B73FF]/20 text-[#5B73FF]
              flex items-center justify-center
              text-[8px] font-bold
            ">
              {getInitials(name)}
            </div>
            <span className="text-[11px] text-white/40 truncate">{name}</span>
          </div>
        </div>

        <div className="flex flex-col items-end gap-1.5 flex-shrink-0">
          <SubmissionStatusBadge status={localStatus} />
          <span className="flex items-center gap-1 text-[10px] text-white/25">
            <Clock size={9} />
            {getRelativeTime(submission.createdAt)}
          </span>
        </div>
      </div>

      {/* ── Message ── */}
      {submission.message && (
        <div className="px-5 py-3 border-b border-white/[0.04]">
          <p className="text-[13px] text-white/55 leading-relaxed">
            {submission.message}
          </p>
        </div>
      )}

      {/* ── Footer ── */}
      <div className="flex items-center gap-3 px-5 py-3">
       {/* Attachment */}
{fileUrl ? (
  <a
    href={fileUrl}
    target="_blank"
    rel="noreferrer"
    className="
      flex items-center gap-1.5
      text-[12px]
      font-medium
      text-[#5B73FF]
      hover:text-white
      transition-colors duration-150
    "
  >
    <Paperclip size={12} />
    <span className="truncate max-w-[160px]">
      {fileName}
    </span>
    <ExternalLink
      size={10}
      className="flex-shrink-0"
    />
  </a>
) : (
  <span className="flex items-center gap-1.5 text-[11px] text-white/20">
    <Paperclip size={11} />
    No attachment
  </span>
)}

        {!isDone && (
          <div className="flex items-center gap-2 ml-auto">
            <button
              onClick={() => handleAction("REVISION_REQUIRED")}
              disabled={!!actionLoading}
              className={`
                flex items-center gap-1.5
                h-8 px-3 rounded-lg
                text-[12px] font-semibold border
                transition-all duration-150
                ${actionLoading === "REVISION_REQUIRED"
                  ? "bg-[#F43F5E]/10 border-[#F43F5E]/20 text-[#F43F5E]/60 cursor-not-allowed"
                  : "bg-[#F43F5E]/10 border-[#F43F5E]/20 text-[#F43F5E] hover:bg-[#F43F5E]/20"
                }
              `}
            >
              {actionLoading === "REVISION_REQUIRED"
                ? <Loader2 size={12} className="animate-spin" />
                : <RefreshCw size={12} />
              }
              Revise
            </button>

            <button
              onClick={() => handleAction("APPROVED")}
              disabled={!!actionLoading}
              className={`
                flex items-center gap-1.5
                h-8 px-3 rounded-lg
                text-[12px] font-semibold
                transition-all duration-150
                ${actionLoading === "APPROVED"
                  ? "bg-[#22C97B]/60 text-white/60 cursor-not-allowed"
                  : "bg-[#22C97B] hover:bg-[#1db36e] text-white"
                }
              `}
            >
              {actionLoading === "APPROVED"
                ? <Loader2 size={12} className="animate-spin" />
                : <CheckCircle size={12} />
              }
              Approve
            </button>
          </div>
        )}

        {isDone && (
          <div className="ml-auto flex items-center gap-1.5 text-[12px] text-white/30">
            <AlertCircle size={12} />
            {localStatus === "APPROVED" ? "Approved" : "Revision requested"}
          </div>
        )}
      </div>
    </motion.div>
  );
};

// ── Constants ─────────────────────────────────────────────
const FILTERS = [
  { key: "ALL",               label: "All"      },
  { key: "PENDING",           label: "Pending"  },
  { key: "APPROVED",          label: "Approved" },
  { key: "REVISION_REQUIRED", label: "Revision" },
];

// ── SubmissionsPage ───────────────────────────────────────
const SubmissionsPage = () => {
  const queryClient          = useQueryClient();
  const [filter, setFilter]  = useState("ALL");
  const [search, setSearch]  = useState("");

  const { data, isLoading } = useQuery({
    queryKey: ["submissions"],
    queryFn:  getSubmissions,
  });

  const submissions = data?.data ?? [];

  const pending  = submissions.filter((s) => s.status === "PENDING" || !s.status).length;
  const approved = submissions.filter((s) => s.status === "APPROVED").length;
  const revision = submissions.filter((s) => s.status === "REVISION_REQUIRED").length;

  const handleReview = useCallback(async (id, status) => {
    await reviewSubmission(id, status);
    queryClient.setQueryData(["submissions"], (old) => ({
      ...old,
      data: {
        ...old?.data,
        data: (old?.data?.data ?? []).map((s) =>
          s._id === id ? { ...s, status } : s
        ),
      },
    }));
  }, [queryClient]);

  const filtered = useMemo(() =>
    submissions.filter((s) => {
      const passesFilter =
        filter === "ALL"     ? true :
        filter === "PENDING" ? (s.status === "PENDING" || !s.status) :
        s.status === filter;
      const passesSearch = !search.trim() ||
        s.taskId?.title?.toLowerCase().includes(search.toLowerCase()) ||
        s.submittedBy?.fullName?.toLowerCase().includes(search.toLowerCase());
      return passesFilter && passesSearch;
    }),
  [submissions, filter, search]);

  if (isLoading) {
    return (
      <DashboardLayout>
        <div className="mb-8 space-y-2">
          <div className="h-6 w-36 rounded-lg bg-white/[0.06] animate-pulse" />
          <div className="h-4 w-52 rounded-lg bg-white/[0.04] animate-pulse" />
        </div>
        <Loader variant="card" count={4} />
      </DashboardLayout>
    );
  }

  return (
    <DashboardLayout>

      {/* ── Page header ── */}
      <div className="flex items-start justify-between mb-8">
        <div>
          <p className="text-[11px] font-semibold text-white/30 uppercase tracking-widest mb-1">
            Review Center
          </p>
          <h1 className="text-[22px] font-semibold text-white/90 leading-tight">
            Submissions
          </h1>
          <p className="text-[13px] text-white/35 mt-1">
            Review and approve work submitted by your team.
          </p>
        </div>

        {pending > 0 && (
          <div className="
            hidden sm:flex flex-col items-end gap-1
            px-4 py-3 rounded-xl
            bg-[#F59E0B]/10 border border-[#F59E0B]/20
          ">
            <p className="text-[11px] text-[#F59E0B]/70 font-medium uppercase tracking-widest">
              Pending
            </p>
            <p className="text-[22px] font-semibold text-[#F59E0B] tabular-nums leading-none">
              {pending}
            </p>
          </div>
        )}
      </div>

      {/* ── Status summary strip ── */}
      {submissions.length > 0 && (
        <div className="
          grid grid-cols-3 divide-x divide-white/[0.05]
          bg-[#1A1A24] border border-white/[0.07]
          rounded-xl mb-6 overflow-hidden
        ">
          {[
            { label: "Pending",  value: pending,  color: "text-[#F59E0B]", dot: "bg-[#F59E0B]", key: "PENDING"           },
            { label: "Approved", value: approved, color: "text-[#22C97B]", dot: "bg-[#22C97B]", key: "APPROVED"          },
            { label: "Revision", value: revision, color: "text-[#F43F5E]", dot: "bg-[#F43F5E]", key: "REVISION_REQUIRED" },
          ].map(({ label, value, color, dot, key }) => (
            <div
              key={label}
              onClick={() => setFilter(key)}
              className="flex flex-col gap-1 px-5 py-3 cursor-pointer hover:bg-white/[0.02] transition-colors"
            >
              <p className="text-[10px] font-semibold uppercase tracking-widest text-white/25 flex items-center gap-1.5">
                <span className={`w-1.5 h-1.5 rounded-full ${dot}`} />
                {label}
              </p>
              <p className={`text-[20px] font-semibold tabular-nums leading-none ${value > 0 ? color : "text-white/30"}`}>
                {value}
              </p>
            </div>
          ))}
        </div>
      )}

      {/* ── Filter + search bar ── */}
      <div className="flex flex-wrap items-center gap-2 mb-6 pb-5 border-b border-white/[0.05]">
        <Filter size={13} className="text-white/25 flex-shrink-0" />
        {FILTERS.map((f) => (
          <FilterTab
            key={f.key}
            active={filter === f.key}
            onClick={() => setFilter(f.key)}
          >
            {f.label}
            {f.key === "PENDING" && pending > 0 && (
              <span className="
                ml-1.5 inline-flex items-center justify-center
                w-4 h-4 rounded-full
                bg-[#F59E0B] text-white text-[9px] font-bold
              ">
                {pending}
              </span>
            )}
          </FilterTab>
        ))}

        <div className="relative ml-auto">
          <Search
            size={13}
            className="absolute left-3 top-1/2 -translate-y-1/2 text-white/25 pointer-events-none"
          />
          <input
            type="text"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Search submissions..."
            className="
              h-8 pl-8 pr-3 w-48
              bg-[#111118] border border-white/[0.07]
              rounded-lg
              text-[12px] text-white/70
              placeholder:text-white/20
              outline-none
              focus:border-[#5B73FF]/50
              focus:ring-2 focus:ring-[#5B73FF]/10
              transition-all duration-150
            "
          />
        </div>

        <span className="text-[11px] text-white/20 tabular-nums whitespace-nowrap">
          {filtered.length} {filtered.length === 1 ? "submission" : "submissions"}
        </span>
      </div>

      {/* ── Content ── */}
      {filtered.length === 0 ? (
        <EmptyState
          preset={submissions.length === 0 ? "submissions" : "search"}
          title={submissions.length === 0
            ? "No submissions yet"
            : "No submissions match your search"
          }
          description={submissions.length === 0
            ? "Submitted work from your team will appear here."
            : "Try adjusting your search or filter."
          }
          secondary={
            (filter !== "ALL" || search)
              ? { label: "Clear filters", onClick: () => { setFilter("ALL"); setSearch(""); } }
              : undefined
          }
        />
      ) : (
        <div className="space-y-3">
          <AnimatePresence initial={false}>
            {filtered.map((submission) => (
              <SubmissionCard
                key={submission._id}
                submission={submission}
                onReview={handleReview}
              />
            ))}
          </AnimatePresence>
        </div>
      )}

    </DashboardLayout>
  );
};

export default SubmissionsPage;