import { useState, useRef, useEffect } from "react";
import { Menu, Bell, LogOut, ChevronDown, User, Settings, Shield } from "lucide-react";
import { useLocation, useNavigate }    from "react-router-dom";
import { useQuery }                    from "@tanstack/react-query";
import { motion, AnimatePresence }     from "framer-motion";
import useAuthStore                    from "../../store/authStore";
import useUIStore                      from "../../store/uiStore";
import { getNotifications }            from "../../services/notificationService";

// ── Page titles ───────────────────────────────────────────
const pageTitles = {
  "/":              "Dashboard",
  "/teams":         "Teams",
  "/employees":     "Employees",
  "/tasks":         "Tasks",
  "/submissions":   "Submissions",
  "/attendance":    "Attendance",
  "/notifications": "Notifications",
  "/daily-reports": "Daily Reports",
  "/activity-feed": "Activity Feed",
  "/profile":       "Profile & Settings",
};

const roleLabels = {
  BOSS:        "Administrator",
  TEAM_LEADER: "Team Leader",
  WORKER:      "Team Member",
};

// ── Click-outside hook ────────────────────────────────────
const useClickOutside = (ref, handler) => {
  useEffect(() => {
    const listener = (e) => {
      if (!ref.current || ref.current.contains(e.target)) return;
      handler();
    };
    document.addEventListener("mousedown", listener);
    return () => document.removeEventListener("mousedown", listener);
  }, [ref, handler]);
};

// ── Relative time ─────────────────────────────────────────
const getRelativeTime = (date) => {
  const diff = Math.floor((Date.now() - new Date(date)) / 1000);
  if (diff < 60)    return "just now";
  if (diff < 3600)  return `${Math.floor(diff / 60)}m ago`;
  if (diff < 86400) return `${Math.floor(diff / 3600)}h ago`;
  return new Date(date).toLocaleDateString("en-US", { month: "short", day: "numeric" });
};

// ── Notification type icon color ──────────────────────────
const getNotifColor = (type) => {
  if (type?.startsWith("TASK"))        return "text-[#5B73FF]";
  if (type === "REPORT_SUBMITTED")     return "text-[#F59E0B]";
  if (type === "ATTENDANCE")           return "text-[#22C97B]";
  return "text-white/40";
};

// ── Notification dropdown ─────────────────────────────────
const NotificationDropdown = ({ onClose }) => {
  const navigate = useNavigate();

  const { data } = useQuery({
    queryKey: ["notifications"],
    queryFn:  getNotifications,
    staleTime: 30_000,
  });

  const notifications = (data?.data ?? []).slice(0, 6);
  const unread        = notifications.filter((n) => !n.isRead).length;

  return (
    <motion.div
      initial={{ opacity: 0, scale: 0.96, y: -6  }}
      animate={{ opacity: 1, scale: 1,    y: 0   }}
      exit={{    opacity: 0, scale: 0.96, y: -4  }}
      transition={{ duration: 0.15, ease: [0.16, 1, 0.3, 1] }}
      className="
        absolute right-0 top-full mt-2
        w-80
        bg-[#1A1A24] border border-white/[0.10]
        rounded-xl overflow-hidden
        shadow-2xl shadow-black/50
        z-50
      "
    >
      {/* Header */}
      <div className="flex items-center justify-between px-4 py-3 border-b border-white/[0.06]">
        <span className="text-[13px] font-semibold text-white/80">
          Notifications
        </span>
        {unread > 0 && (
          <span className="
            text-[10px] font-bold
            px-2 py-0.5 rounded-full
            bg-[#F43F5E]/15 text-[#F43F5E]
            border border-[#F43F5E]/20
          ">
            {unread} unread
          </span>
        )}
      </div>

      {/* List */}
      <div className="max-h-72 overflow-y-auto">
        {notifications.length === 0 ? (
          <div className="py-10 text-center">
            <Bell size={20} className="text-white/15 mx-auto mb-2" />
            <p className="text-[12px] text-white/25">You're all caught up</p>
          </div>
        ) : (
          notifications.map((notif) => (
            <div
              key={notif._id}
              className={`
                flex items-start gap-3 px-4 py-3
                border-b border-white/[0.04] last:border-0
                cursor-pointer transition-colors duration-100
                ${!notif.isRead ? "bg-[#5B73FF]/[0.04]" : "hover:bg-white/[0.03]"}
              `}
            >
              {/* Unread dot */}
              {!notif.isRead && (
                <span className="w-1 h-1 rounded-full bg-[#5B73FF] flex-shrink-0 mt-2" />
              )}
              <div className="flex-1 min-w-0">
                <p className={`
                  text-[12px] leading-snug
                  ${!notif.isRead ? "text-white/80 font-medium" : "text-white/50"}
                `}>
                  {notif.message}
                </p>
                <p className={`
                  text-[10px] mt-0.5
                  ${getNotifColor(notif.type)}
                `}>
                  {getRelativeTime(notif.createdAt)}
                </p>
              </div>
            </div>
          ))
        )}
      </div>

      {/* Footer */}
      <button
        onClick={() => { navigate("/notifications"); onClose(); }}
        className="
          w-full py-2.5 text-center
          text-[12px] font-medium text-[#5B73FF]
          hover:bg-white/[0.03]
          border-t border-white/[0.06]
          transition-colors duration-150
        "
      >
        View all notifications →
      </button>
    </motion.div>
  );
};

// ── User dropdown ─────────────────────────────────────────
const UserDropdown = ({ user, logout, onClose }) => {
  const navigate = useNavigate();
  const initials = user?.name
    ? user.name.split(" ").map((n) => n[0]).join("").slice(0, 2).toUpperCase()
    : "??";

  const menuItems = [
    {
      icon:    User,
      label:   "Profile",
      sub:     "View your profile",
      onClick: () => { navigate("/profile"); onClose(); },
    },
    {
      icon:    Settings,
      label:   "Settings",
      sub:     "Preferences & security",
      onClick: () => { navigate("/settings"); onClose(); },
    },
    {
      icon:    Shield,
      label:   roleLabels[user?.role] ?? "Member",
      sub:     "Your current role",
      onClick: null,
      muted:   true,
    },
  ];

  return (
    <motion.div
      initial={{ opacity: 0, scale: 0.96, y: -6  }}
      animate={{ opacity: 1, scale: 1,    y: 0   }}
      exit={{    opacity: 0, scale: 0.96, y: -4  }}
      transition={{ duration: 0.15, ease: [0.16, 1, 0.3, 1] }}
      className="
        absolute right-0 top-full mt-2
        w-64
        bg-[#1A1A24] border border-white/[0.10]
        rounded-xl overflow-hidden
        shadow-2xl shadow-black/50
        z-50
      "
    >
      {/* User identity header */}
      <div className="flex items-center gap-3 px-4 py-4 border-b border-white/[0.06]">
        <div className="
          relative w-9 h-9 rounded-full flex-shrink-0
          bg-[#5B73FF]/20 text-[#5B73FF]
          flex items-center justify-center
          text-[12px] font-bold
        ">
          {initials}
          <span className="
            absolute -bottom-px -right-px
            w-2.5 h-2.5 rounded-full
            bg-[#22C97B] border-2 border-[#1A1A24]
          " />
        </div>
        <div className="flex-1 min-w-0">
          <p className="text-[13px] font-semibold text-white/90 truncate leading-none">
            {user?.name ?? "User"}
          </p>
          <p className="text-[11px] text-white/35 mt-0.5 truncate leading-none">
            {user?.email ?? ""}
          </p>
        </div>
      </div>

      {/* Menu items */}
      <div className="p-1.5">
        {menuItems.map((item) => {
          const Icon = item.icon;
          return (
            <button
              key={item.label}
              onClick={item.onClick ?? undefined}
              disabled={!item.onClick}
              className={`
                w-full flex items-center gap-3
                px-3 py-2.5 rounded-lg text-left
                transition-colors duration-100
                ${item.onClick
                  ? "hover:bg-white/[0.05] cursor-pointer"
                  : "cursor-default opacity-60"
                }
              `}
            >
              <div className="
                w-6 h-6 rounded-md flex-shrink-0
                bg-white/[0.05]
                flex items-center justify-center
              ">
                <Icon size={12} className="text-white/40" />
              </div>
              <div className="flex-1 min-w-0">
                <p className="text-[12px] font-medium text-white/75 leading-none">
                  {item.label}
                </p>
                <p className="text-[10px] text-white/30 mt-0.5 leading-none">
                  {item.sub}
                </p>
              </div>
            </button>
          );
        })}
      </div>

      {/* Logout */}
      <div className="p-1.5 border-t border-white/[0.06]">
        <button
          onClick={() => { logout(); onClose(); }}
          className="
            w-full flex items-center gap-3
            px-3 py-2.5 rounded-lg text-left
            hover:bg-[#F43F5E]/10
            transition-colors duration-100
            group
          "
        >
          <div className="
            w-6 h-6 rounded-md flex-shrink-0
            bg-[#F43F5E]/10
            flex items-center justify-center
          ">
            <LogOut size={12} className="text-[#F43F5E]" />
          </div>
          <div>
            <p className="text-[12px] font-medium text-[#F43F5E] leading-none">
              Sign out
            </p>
            <p className="text-[10px] text-white/25 mt-0.5 leading-none">
              Log out of your account
            </p>
          </div>
        </button>
      </div>
    </motion.div>
  );
};

// ── Topbar ────────────────────────────────────────────────
const Topbar = () => {
  const logout      = useAuthStore((state) => state.logout);
  const user        = useAuthStore((state) => state.user);
  const openSidebar = useUIStore((state) => state.openSidebar);
  const location    = useLocation();

  const [notifOpen, setNotifOpen] = useState(false);
  const [userOpen,  setUserOpen]  = useState(false);

  const notifRef = useRef(null);
  const userRef  = useRef(null);

  useClickOutside(notifRef, () => setNotifOpen(false));
  useClickOutside(userRef,  () => setUserOpen(false));

  // Fetch unread count for badge
  const { data: notifData } = useQuery({
    queryKey: ["notifications"],
    queryFn:  getNotifications,
    staleTime: 30_000,
  });
  const unreadCount = (notifData?.data ?? []).filter((n) => !n.isRead).length;

  const pageTitle = pageTitles[location.pathname] ?? "Safarian CRM";
  const initials  = user?.name
    ? user.name.split(" ").map((n) => n[0]).join("").slice(0, 2).toUpperCase()
    : "??";

  return (
    <header className="
      sticky top-0 z-30
      h-14
      flex items-center justify-between
      px-5
      bg-[#111118]/80
      backdrop-blur-md
      border-b border-white/[0.06]
    ">
      {/* ── Left ── */}
      <div className="flex items-center gap-3">
        <button
          onClick={openSidebar}
          aria-label="Open sidebar"
          className="
            md:hidden
            flex items-center justify-center
            w-8 h-8 rounded-lg
            text-white/40 hover:text-white/80
            hover:bg-white/[0.06]
            transition-colors duration-150
          "
        >
          <Menu size={18} />
        </button>
        <h1 className="text-[14px] font-semibold text-white/90 tracking-tight">
          {pageTitle}
        </h1>
      </div>

      {/* ── Right ── */}
      <div className="flex items-center gap-2">

        {/* ── Notification bell ── */}
        <div ref={notifRef} className="relative">
          <button
            onClick={() => { setNotifOpen((v) => !v); setUserOpen(false); }}
            aria-label="Notifications"
            className={`
              relative flex items-center justify-center
              w-8 h-8 rounded-lg
              transition-colors duration-150
              ${notifOpen
                ? "bg-white/[0.08] text-white/80"
                : "text-white/40 hover:text-white/80 hover:bg-white/[0.06]"
              }
            `}
          >
            <Bell size={16} />
            {unreadCount > 0 && (
              <span className="
                absolute top-1 right-1
                w-1.5 h-1.5 rounded-full
                bg-[#F43F5E]
              " />
            )}
          </button>

          <AnimatePresence>
            {notifOpen && (
              <NotificationDropdown onClose={() => setNotifOpen(false)} />
            )}
          </AnimatePresence>
        </div>

        {/* Divider */}
        <div className="w-px h-5 bg-white/[0.08] mx-1" />

        {/* ── User menu ── */}
        <div ref={userRef} className="relative">
          <button
            onClick={() => { setUserOpen((v) => !v); setNotifOpen(false); }}
            aria-label="User menu"
            className={`
              flex items-center gap-2.5
              h-8 px-2 rounded-lg
              transition-colors duration-150
              group
              ${userOpen
                ? "bg-white/[0.08]"
                : "hover:bg-white/[0.06]"
              }
            `}
          >
            <div className="relative flex-shrink-0">
              <div className="
                w-6 h-6 rounded-full
                bg-[#5B73FF]/20
                flex items-center justify-center
                text-[10px] font-semibold text-[#5B73FF]
              ">
                {initials}
              </div>
              <span className="
                absolute -bottom-px -right-px
                w-1.5 h-1.5 rounded-full
                bg-[#22C97B] border border-[#111118]
              " />
            </div>

            <div className="hidden md:flex flex-col items-start leading-none">
              <span className="text-[12px] font-medium text-white/80">
                {user?.name ?? "User"}
              </span>
              <span className="text-[10px] text-white/30 mt-0.5">
                {roleLabels[user?.role] ?? ""}
              </span>
            </div>

            <ChevronDown
              size={12}
              className={`
                hidden md:block text-white/25
                transition-transform duration-150
                ${userOpen ? "rotate-180 text-white/50" : "group-hover:text-white/50"}
              `}
            />
          </button>

          <AnimatePresence>
            {userOpen && (
              <UserDropdown
                user={user}
                logout={logout}
                onClose={() => setUserOpen(false)}
              />
            )}
          </AnimatePresence>
        </div>

      </div>
    </header>
  );
};

export default Topbar;