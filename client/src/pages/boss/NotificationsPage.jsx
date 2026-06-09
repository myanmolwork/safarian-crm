import { useState, useEffect, useCallback } from "react";
import { useQuery, useQueryClient }         from "@tanstack/react-query";
import { motion, AnimatePresence }          from "framer-motion";
import {
  Bell,
  CheckCircle,
  FolderKanban,
  FileText,
  Clock,
  Users,
  AlertTriangle,
  Check,
  Filter,
} from "lucide-react";
import DashboardLayout         from "../../layouts/DashboardLayout";
import Loader                  from "../../components/shared/Loader";
import EmptyState              from "../../components/shared/EmptyState";
import { getNotifications }    from "../../services/notificationService";
import socket                  from "../../services/socket";

// ── Notification type config ──────────────────────────────
const getNotifConfig = (type) => {
  const configs = {
    TASK_ASSIGNED:   { icon: FolderKanban, color: "text-[#5B73FF]",  bg: "bg-[#5B73FF]/12",  border: "border-[#5B73FF]/20"  },
    TASK_COMPLETED:  { icon: CheckCircle,  color: "text-[#22C97B]",  bg: "bg-[#22C97B]/12",  border: "border-[#22C97B]/20"  },
    TASK_OVERDUE:    { icon: AlertTriangle,color: "text-[#F43F5E]",  bg: "bg-[#F43F5E]/12",  border: "border-[#F43F5E]/20"  },
    REPORT_SUBMITTED:{ icon: FileText,     color: "text-[#F59E0B]",  bg: "bg-[#F59E0B]/12",  border: "border-[#F59E0B]/20"  },
    ATTENDANCE:      { icon: Clock,        color: "text-[#22C97B]",  bg: "bg-[#22C97B]/12",  border: "border-[#22C97B]/20"  },
    TEAM_UPDATE:     { icon: Users,        color: "text-[#A78BFA]",  bg: "bg-[#A78BFA]/12",  border: "border-[#A78BFA]/20"  },
  };
  return configs[type] ?? {
    icon:   Bell,
    color:  "text-white/40",
    bg:     "bg-white/[0.06]",
    border: "border-white/[0.08]",
  };
};

// ── Relative time ─────────────────────────────────────────
const getRelativeTime = (date) => {
  const diff = Math.floor((Date.now() - new Date(date)) / 1000);
  if (diff < 60)    return "just now";
  if (diff < 3600)  return `${Math.floor(diff / 60)}m ago`;
  if (diff < 86400) return `${Math.floor(diff / 3600)}h ago`;
  return new Date(date).toLocaleDateString("en-US", {
    month: "short", day: "numeric",
  });
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

// ── Single notification item ──────────────────────────────
const NotifItem = ({ notif, onMarkRead }) => {
  const config = getNotifConfig(notif.type);
  const Icon   = config.icon;
  const isNew  = !notif.isRead;

  return (
    <motion.div
      layout
      initial={{ opacity: 0, y: -6  }}
      animate={{ opacity: 1, y: 0   }}
      exit={{    opacity: 0, x: 20, height: 0 }}
      transition={{ duration: 0.18, ease: "easeOut" }}
      className={`
        group relative flex items-start gap-3
        px-5 py-4
        border-b border-white/[0.04] last:border-0
        transition-colors duration-150
        ${isNew ? "bg-[#5B73FF]/[0.04]" : "hover:bg-white/[0.02]"}
      `}
    >
      {/* Unread dot */}
      {isNew && (
        <span className="
          absolute left-2 top-1/2 -translate-y-1/2
          w-1 h-1 rounded-full bg-[#5B73FF]
          flex-shrink-0
        " />
      )}

      {/* Icon badge */}
      <div className={`
        flex items-center justify-center
        w-8 h-8 rounded-xl flex-shrink-0
        border
        ${config.bg} ${config.border}
      `}>
        <Icon size={14} className={config.color} />
      </div>

      {/* Content */}
      <div className="flex-1 min-w-0">
        <p className={`
          text-[13px] leading-snug
          ${isNew ? "text-white/85 font-medium" : "text-white/60"}
        `}>
          {notif.message}
        </p>
        <p className="text-[11px] text-white/25 mt-1">
          {getRelativeTime(notif.createdAt)}
        </p>
      </div>

      {/* Mark read button — shows on hover */}
      {isNew && (
        <button
          onClick={() => onMarkRead(notif._id)}
          title="Mark as read"
          className="
            opacity-0 group-hover:opacity-100
            flex items-center justify-center
            w-6 h-6 rounded-md flex-shrink-0
            text-white/25 hover:text-[#22C97B]
            hover:bg-[#22C97B]/10
            transition-all duration-150
          "
        >
          <Check size={13} />
        </button>
      )}
    </motion.div>
  );
};

// ── Live toast ────────────────────────────────────────────
const LiveToast = ({ notif, onDismiss }) => {
  const config = getNotifConfig(notif?.type);
  const Icon   = config.icon;

  useEffect(() => {
    if (!notif) return;
    const t = setTimeout(onDismiss, 4000);
    return () => clearTimeout(t);
  }, [notif, onDismiss]);

  return (
    <AnimatePresence>
      {notif && (
        <motion.div
          initial={{ opacity: 0, y: -12, scale: 0.97 }}
          animate={{ opacity: 1, y: 0,   scale: 1    }}
          exit={{    opacity: 0, y: -8,  scale: 0.97 }}
          transition={{ duration: 0.2, ease: [0.16, 1, 0.3, 1] }}
          className="
            fixed top-5 left-1/2 -translate-x-1/2 z-50
            flex items-center gap-3
            px-4 py-3 rounded-xl
            bg-[#1A1A24] border border-white/[0.12]
            shadow-2xl shadow-black/40
            min-w-[300px] max-w-sm
          "
        >
          <div className={`
            w-7 h-7 rounded-lg flex-shrink-0
            flex items-center justify-center
            ${config.bg}
          `}>
            <Icon size={13} className={config.color} />
          </div>
          <p className="text-[13px] text-white/80 flex-1 leading-snug">
            {notif.message}
          </p>
          <button
            onClick={onDismiss}
            className="text-white/20 hover:text-white/60 transition-colors flex-shrink-0"
          >
            ×
          </button>
        </motion.div>
      )}
    </AnimatePresence>
  );
};

// ── FILTERS ───────────────────────────────────────────────
const FILTERS = [
  { key: "ALL",    label: "All"      },
  { key: "UNREAD", label: "Unread"   },
  { key: "TASKS",  label: "Tasks"    },
  { key: "REPORTS",label: "Reports"  },
  { key: "SYSTEM", label: "System"   },
];

// ── NotificationsPage ─────────────────────────────────────
const NotificationsPage = () => {
  const queryClient               = useQueryClient();
  const [filter,    setFilter]    = useState("ALL");
  const [liveNotif, setLiveNotif] = useState(null);

  // ── Fetch notifications ──
  const { data, isLoading } = useQuery({
    queryKey: ["notifications"],
    queryFn:  getNotifications,
  });

  const notifications = data?.data ?? [];

  // ── Socket — live notifications ──
  const handleNewNotification = useCallback((notif) => {
    setLiveNotif(notif);
    // Prepend to cache without refetch
    queryClient.setQueryData(["notifications"], (old) => ({
      ...old,
      data: { ...old?.data, data: [notif, ...(old?.data?.data ?? [])] },
    }));
  }, [queryClient]);

  useEffect(() => {
    socket.on("newNotification", handleNewNotification);
    return () => socket.off("newNotification", handleNewNotification);
  }, [handleNewNotification]);

  // ── Mark one read ──
  const handleMarkRead = useCallback((id) => {
    queryClient.setQueryData(["notifications"], (old) => ({
      ...old,
      data: {
        ...old?.data,
        data: (old?.data?.data ?? []).map((n) =>
          n._id === id ? { ...n, isRead: true } : n
        ),
      },
    }));
  }, [queryClient]);

  // ── Mark all read ──
  const handleMarkAllRead = useCallback(() => {
    queryClient.setQueryData(["notifications"], (old) => ({
      ...old,
      data: {
        ...old?.data,
        data: (old?.data?.data ?? []).map((n) => ({ ...n, isRead: true })),
      },
    }));
  }, [queryClient]);

  // ── Derived ──
  const unreadCount = notifications.filter((n) => !n.isRead).length;

  // ── Filter ──
  const filtered = notifications.filter((n) => {
    if (filter === "UNREAD")  return !n.isRead;
    if (filter === "TASKS")   return n.type?.startsWith("TASK");
    if (filter === "REPORTS") return n.type === "REPORT_SUBMITTED";
    if (filter === "SYSTEM")  return n.type === "TEAM_UPDATE" || n.type === "ATTENDANCE";
    return true;
  });

  // ── Loading ──
  if (isLoading) {
    return (
      <DashboardLayout>
        <div className="mb-8 space-y-2">
          <div className="h-6 w-40 rounded-lg bg-white/[0.06] animate-pulse" />
          <div className="h-4 w-56 rounded-lg bg-white/[0.04] animate-pulse" />
        </div>
        <Loader variant="section" />
      </DashboardLayout>
    );
  }

  return (
    <DashboardLayout>

      {/* ── Live toast ── */}
      <LiveToast
        notif={liveNotif}
        onDismiss={() => setLiveNotif(null)}
      />

      {/* ── Page header ── */}
      <div className="flex items-start justify-between mb-8">
        <div>
          <p className="text-[11px] font-semibold text-white/30 uppercase tracking-widest mb-1">
            Updates
          </p>
          <h1 className="text-[22px] font-semibold text-white/90 leading-tight">
            Notifications
          </h1>
          <p className="text-[13px] text-white/35 mt-1">
            Stay up to date with your team's activity.
          </p>
        </div>

        {/* Unread count pill + mark all read */}
        <div className="flex items-center gap-3">
          {unreadCount > 0 && (
            <>
              <div className="
                hidden sm:flex flex-col items-end gap-1
                px-4 py-3 rounded-xl
                bg-[#1A1A24] border border-white/[0.07]
              ">
                <p className="text-[11px] text-white/30 font-medium uppercase tracking-widest">
                  Unread
                </p>
                <p className="text-[22px] font-semibold text-[#5B73FF] tabular-nums leading-none">
                  {unreadCount}
                </p>
              </div>

              <button
                onClick={handleMarkAllRead}
                className="
                  flex items-center gap-2
                  h-9 px-4 rounded-lg
                  bg-white/[0.04] hover:bg-white/[0.08]
                  border border-white/[0.07]
                  text-[12px] font-medium text-white/40 hover:text-white/70
                  transition-all duration-150
                "
              >
                <Check size={13} />
                Mark all read
              </button>
            </>
          )}
        </div>
      </div>

      {/* ── Filter bar ── */}
      <div className="
        flex items-center gap-2
        mb-6 pb-5 border-b border-white/[0.05]
        overflow-x-auto
      ">
        <Filter size={13} className="text-white/25 flex-shrink-0" />
        {FILTERS.map((f) => (
          <FilterTab
            key={f.key}
            active={filter === f.key}
            onClick={() => setFilter(f.key)}
          >
            {f.label}
            {f.key === "UNREAD" && unreadCount > 0 && (
              <span className="
                ml-1.5 inline-flex items-center justify-center
                w-4 h-4 rounded-full
                bg-[#F43F5E] text-white text-[9px] font-bold
              ">
                {unreadCount}
              </span>
            )}
          </FilterTab>
        ))}

        <span className="ml-auto text-[11px] text-white/20 tabular-nums whitespace-nowrap">
          {filtered.length} {filtered.length === 1 ? "notification" : "notifications"}
        </span>
      </div>

      {/* ── Content ── */}
      {filtered.length === 0 ? (
        <EmptyState
          preset="notifications"
          title={filter === "ALL"
            ? "You're all caught up"
            : `No ${FILTERS.find(f => f.key === filter)?.label.toLowerCase()} notifications`
          }
          description={filter === "ALL"
            ? "New notifications will appear here in real time."
            : "Try selecting a different filter."
          }
          secondary={filter !== "ALL"
            ? { label: "Show all", onClick: () => setFilter("ALL") }
            : undefined
          }
        />
      ) : (
        <div className="
          bg-[#1A1A24] border border-white/[0.07]
          rounded-2xl overflow-hidden
        ">
          <AnimatePresence initial={false}>
            {filtered.map((notif) => (
              <NotifItem
                key={notif._id}
                notif={notif}
                onMarkRead={handleMarkRead}
              />
            ))}
          </AnimatePresence>
        </div>
      )}

    </DashboardLayout>
  );
};

export default NotificationsPage;