import { useState, useRef, useEffect } from "react";
import {
  LayoutDashboard,
  Users,
  FolderKanban,
  ClipboardCheck,
  Bell,
  Briefcase,
  FileText,
  ClipboardList,
  Activity,
  ChevronRight,
  User,
  Settings,
  Shield,
  LogOut,
} from "lucide-react";
import { NavLink, useNavigate } from "react-router-dom";
import { useQuery }             from "@tanstack/react-query";
import { motion, AnimatePresence } from "framer-motion";
import useAuthStore             from "../../store/authStore";
import useUIStore               from "../../store/uiStore";
import { getNotifications }     from "../../services/notificationService";

// ── Menu items ────────────────────────────────────────────
const menuItems = {
  BOSS: [
    { label: "Dashboard",    icon: LayoutDashboard, path: "/"              },
    { label: "Teams",        icon: Briefcase,       path: "/teams"         },
    { label: "Employees",    icon: Users,           path: "/employees"     },
    { label: "Tasks",        icon: FolderKanban,    path: "/tasks"         },
    { label: "Submissions",  icon: FileText,        path: "/submissions"   },
    { label: "Attendance",   icon: ClipboardCheck,  path: "/attendance"    },
    { label: "Notifications",icon: Bell,            path: "/notifications" },
    { label: "Daily Reports",icon: ClipboardList,   path: "/daily-reports" },
    { label: "Activity Feed",icon: Activity,        path: "/activity-feed" },
  ],
  TEAM_LEADER: [
    { label: "Dashboard",    icon: LayoutDashboard, path: "/"              },
    { label: "Teams",        icon: Briefcase,       path: "/teams"         },
    { label: "Tasks",        icon: FolderKanban,    path: "/tasks"         },
    { label: "Submissions",  icon: FileText,        path: "/submissions"   },
    { label: "Attendance",   icon: ClipboardCheck,  path: "/attendance"    },
    { label: "Notifications",icon: Bell,            path: "/notifications" },
    { label: "Daily Reports",icon: ClipboardList,   path: "/daily-reports" },
    { label: "Activity Feed",icon: Activity,        path: "/activity-feed" },
  ],
  WORKER: [
    { label: "My Tasks",     icon: FolderKanban,    path: "/tasks"         },
    { label: "Submissions",  icon: FileText,        path: "/submissions"   },
    { label: "Attendance",   icon: ClipboardCheck,  path: "/attendance"    },
    { label: "Notifications",icon: Bell,            path: "/notifications" },
    { label: "Daily Reports",icon: ClipboardList,   path: "/daily-reports" },
    { label: "Activity Feed",icon: Activity,        path: "/activity-feed" },
  ],
};

const roleLabels = {
  BOSS:        "Administrator",
  TEAM_LEADER: "Team Leader",
  WORKER:      "Team Member",
};

const sectionGroups = {
  BOSS: [
    { heading: "Overview",   items: ["Dashboard"]                                      },
    { heading: "Management", items: ["Teams", "Employees", "Tasks", "Submissions"]     },
    { heading: "Workforce",  items: ["Attendance", "Daily Reports"]                    },
    { heading: "Updates",    items: ["Notifications", "Activity Feed"]                 },
  ],
  TEAM_LEADER: [
    { heading: "Overview",   items: ["Dashboard"]                                      },
    { heading: "Management", items: ["Teams", "Tasks", "Submissions"]                  },
    { heading: "Workforce",  items: ["Attendance", "Daily Reports"]                    },
    { heading: "Updates",    items: ["Notifications", "Activity Feed"]                 },
  ],
  WORKER: [
    { heading: "Work",       items: ["My Tasks", "Submissions", "Attendance"]          },
    { heading: "Reports",    items: ["Daily Reports"]                                  },
    { heading: "Updates",    items: ["Notifications", "Activity Feed"]                 },
  ],
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

// ── User popup (opens upward from footer) ─────────────────
const UserPopup = ({ user, logout, onClose }) => {
  const navigate = useNavigate();

  const menuActions = [
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
      onClick: () => { navigate("/profile"); onClose(); },
    },
    {
      icon:    Shield,
      label:   roleLabels[user?.role] ?? "Member",
      sub:     "Your current role",
      onClick: null,
    },
  ];

  const initials = user?.name
    ? user.name.split(" ").map((n) => n[0]).join("").slice(0, 2).toUpperCase()
    : "??";

  return (
    <motion.div
      initial={{ opacity: 0, scale: 0.96, y: 8   }}
      animate={{ opacity: 1, scale: 1,    y: 0   }}
      exit={{    opacity: 0, scale: 0.96, y: 8   }}
      transition={{ duration: 0.15, ease: [0.16, 1, 0.3, 1] }}
      className="
        absolute bottom-full left-3 right-3 mb-2
        bg-[#1E1E2C] border border-white/[0.10]
        rounded-xl overflow-hidden
        shadow-2xl shadow-black/60
        z-50
      "
    >
      {/* Identity header */}
      <div className="flex items-center gap-3 px-4 py-3.5 border-b border-white/[0.06]">
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
            bg-[#22C97B] border-2 border-[#1E1E2C]
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

      {/* Menu actions */}
      <div className="p-1.5">
        {menuActions.map((action) => {
          const Icon = action.icon;
          return (
            <button
              key={action.label}
              onClick={action.onClick ?? undefined}
              disabled={!action.onClick}
              className={`
                w-full flex items-center gap-3
                px-3 py-2.5 rounded-lg text-left
                transition-colors duration-100
                ${action.onClick
                  ? "hover:bg-white/[0.05] cursor-pointer"
                  : "cursor-default opacity-50"
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
              <div className="min-w-0">
                <p className="text-[12px] font-medium text-white/75 leading-none">
                  {action.label}
                </p>
                <p className="text-[10px] text-white/30 mt-0.5 leading-none">
                  {action.sub}
                </p>
              </div>
            </button>
          );
        })}
      </div>

      {/* Sign out */}
      <div className="p-1.5 border-t border-white/[0.06]">
        <button
          onClick={() => { logout(); onClose(); }}
          className="
            w-full flex items-center gap-3
            px-3 py-2.5 rounded-lg text-left
            hover:bg-[#F43F5E]/10
            transition-colors duration-100
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

// ── Sidebar ───────────────────────────────────────────────
const Sidebar = () => {
  const user         = useAuthStore((state) => state.user);
  const logout       = useAuthStore((state) => state.logout);
  const role         = user?.role;
  const { sidebarOpen, closeSidebar } = useUIStore();

  const [userPopupOpen, setUserPopupOpen] = useState(false);
  const userPopupRef = useRef(null);
  useClickOutside(userPopupRef, () => setUserPopupOpen(false));

  const items  = menuItems[role]    ?? [];
  const groups = sectionGroups[role] ?? [];
  const itemMap = Object.fromEntries(items.map((i) => [i.label, i]));

  // ── Real unread count ──
  const { data: notifData } = useQuery({
    queryKey: ["notifications"],
    queryFn:  getNotifications,
    staleTime: 30_000,
  });
  const unreadCount = (notifData?.data ?? []).filter((n) => !n.isRead).length;

  return (
    <>
      {/* Mobile backdrop */}
      {sidebarOpen && (
        <div
          className="fixed inset-0 z-40 bg-black/60 backdrop-blur-sm md:hidden"
          onClick={closeSidebar}
        />
      )}

      <aside
        className={`
          fixed md:static z-50
          flex flex-col
          h-screen w-[240px]
          bg-[#111118]
          border-r border-white/[0.06]
          transition-transform duration-300 ease-out
          ${sidebarOpen ? "translate-x-0" : "-translate-x-full md:translate-x-0"}
        `}
      >
        {/* ── Logo ── */}
        <div className="flex items-center gap-3 px-5 pt-6 pb-5 border-b border-white/[0.06]">
          <div className="flex items-center justify-center w-7 h-7 rounded-lg bg-[#5B73FF] flex-shrink-0">
            <Briefcase size={14} className="text-white" />
          </div>
          <div className="min-w-0">
            <p className="text-[13px] font-semibold text-white leading-none truncate">
              Safarian CRM
            </p>
            <p className="text-[10px] text-white/40 mt-0.5 leading-none">
              {roleLabels[role] ?? ""}
            </p>
          </div>
        </div>

        {/* ── Navigation ── */}
        <nav className="flex-1 overflow-y-auto overflow-x-hidden px-3 py-4 space-y-5">
          {groups.map((group) => (
            <div key={group.heading}>
              <p className="px-2 mb-1 text-[10px] font-semibold uppercase tracking-widest text-white/25 select-none">
                {group.heading}
              </p>

              <div className="space-y-0.5">
                {group.items.map((label) => {
                  const item = itemMap[label];
                  if (!item) return null;
                  const Icon = item.icon;
                  const isNotif = label === "Notifications";

                  return (
                    <NavLink
                      key={label}
                      to={item.path}
                      end={item.path === "/"}
                      onClick={closeSidebar}
                      className={({ isActive }) =>
                        `group relative flex items-center gap-3 w-full px-3 py-2 rounded-lg
                         text-[13px] font-medium transition-all duration-150 outline-none
                         ${isActive
                           ? "bg-[#5B73FF]/15 text-[#5B73FF]"
                           : "text-white/45 hover:text-white/80 hover:bg-white/[0.05]"
                         }`
                      }
                    >
                      {({ isActive }) => (
                        <>
                          {/* Active bar */}
                          {isActive && (
                            <span className="absolute left-0 top-1/2 -translate-y-1/2 w-0.5 h-4 rounded-full bg-[#5B73FF]" />
                          )}

                          <Icon
                            size={16}
                            className={`flex-shrink-0 transition-colors duration-150 ${
                              isActive ? "text-[#5B73FF]" : "text-white/30 group-hover:text-white/60"
                            }`}
                          />

                          <span className="truncate flex-1">{label}</span>

                          {/* ✅ Real unread count — only shown when > 0 */}
                          {isNotif && unreadCount > 0 && (
                            <span className="
                              ml-auto flex-shrink-0
                              min-w-[18px] h-[18px] px-1
                              rounded-full
                              bg-[#F43F5E] text-white
                              text-[9px] font-bold
                              flex items-center justify-center
                              tabular-nums
                            ">
                              {unreadCount > 99 ? "99+" : unreadCount}
                            </span>
                          )}
                        </>
                      )}
                    </NavLink>
                  );
                })}
              </div>
            </div>
          ))}
        </nav>

        {/* ── User footer ── */}
        <div ref={userPopupRef} className="relative px-3 pb-4 pt-3 border-t border-white/[0.06]">

          {/* User popup — opens upward */}
          <AnimatePresence>
            {userPopupOpen && (
              <UserPopup
                user={user}
                logout={logout}
                onClose={() => setUserPopupOpen(false)}
              />
            )}
          </AnimatePresence>

          {/* Footer trigger button */}
          <button
            onClick={() => setUserPopupOpen((v) => !v)}
            className={`
              w-full flex items-center gap-3
              px-3 py-2.5 rounded-lg
              transition-colors duration-150
              group
              ${userPopupOpen
                ? "bg-white/[0.07]"
                : "hover:bg-white/[0.05]"
              }
            `}
          >
            {/* Avatar */}
            <div className="relative flex-shrink-0">
              <div className="w-7 h-7 rounded-full bg-[#5B73FF]/20 flex items-center justify-center text-[11px] font-semibold text-[#5B73FF]">
                {user?.name
                  ? user.name.split(" ").map((n) => n[0]).join("").slice(0, 2).toUpperCase()
                  : "??"}
              </div>
              <span className="absolute bottom-0 right-0 w-2 h-2 rounded-full bg-[#22C97B] border-2 border-[#111118]" />
            </div>

            {/* Name + email */}
            <div className="flex-1 min-w-0 text-left">
              <p className="text-[12px] font-medium text-white/80 truncate leading-none">
                {user?.name ?? "User"}
              </p>
              <p className="text-[10px] text-white/30 mt-0.5 leading-none truncate">
                {user?.email ?? ""}
              </p>
            </div>

            <ChevronRight
              size={13}
              className={`
                flex-shrink-0 transition-all duration-150
                ${userPopupOpen
                  ? "text-white/50 rotate-90"
                  : "text-white/20 group-hover:text-white/40"
                }
              `}
            />
          </button>
        </div>
      </aside>
    </>
  );
};

export default Sidebar;