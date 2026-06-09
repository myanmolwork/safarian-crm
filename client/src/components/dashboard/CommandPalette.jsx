import { useState, useEffect } from "react";
import { useNavigate }         from "react-router-dom";
import { motion, AnimatePresence } from "framer-motion";
import {
  Command,
  CommandInput,
  CommandList,
  CommandItem,
  CommandGroup,
  CommandEmpty,
} from "cmdk";
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
  ArrowRight,
  Hash,
  Search,
} from "lucide-react";
import useAuthStore from "../../store/authStore";

// ── Navigation items per role ─────────────────────────────
const NAV_ITEMS = {
  BOSS: [
    { label: "Dashboard",    path: "/",              icon: LayoutDashboard, description: "Overview & analytics"        },
    { label: "Teams",        path: "/teams",         icon: Briefcase,       description: "Manage your teams"           },
    { label: "Employees",    path: "/employees",     icon: Users,           description: "All team members"            },
    { label: "Tasks",        path: "/tasks",         icon: FolderKanban,    description: "Kanban board & task list"    },
    { label: "Submissions",  path: "/submissions",   icon: FileText,        description: "Review submitted work"       },
    { label: "Attendance",   path: "/attendance",    icon: ClipboardCheck,  description: "Track attendance records"    },
    { label: "Notifications",path: "/notifications", icon: Bell,            description: "Alerts & updates"            },
    { label: "Daily Reports",path: "/daily-reports", icon: ClipboardList,   description: "Team daily work reports"     },
    { label: "Activity Feed",path: "/activity-feed", icon: Activity,        description: "Timeline of all actions"     },
  ],
  TEAM_LEADER: [
    { label: "Dashboard",    path: "/",              icon: LayoutDashboard, description: "Overview & analytics"        },
    { label: "Teams",        path: "/teams",         icon: Briefcase,       description: "Manage your teams"           },
    { label: "Tasks",        path: "/tasks",         icon: FolderKanban,    description: "Kanban board & task list"    },
    { label: "Submissions",  path: "/submissions",   icon: FileText,        description: "Review submitted work"       },
    { label: "Attendance",   path: "/attendance",    icon: ClipboardCheck,  description: "Track attendance records"    },
    { label: "Notifications",path: "/notifications", icon: Bell,            description: "Alerts & updates"            },
    { label: "Daily Reports",path: "/daily-reports", icon: ClipboardList,   description: "Team daily work reports"     },
    { label: "Activity Feed",path: "/activity-feed", icon: Activity,        description: "Timeline of all actions"     },
  ],
  WORKER: [
    { label: "My Tasks",     path: "/tasks",         icon: FolderKanban,    description: "Your assigned tasks"         },
    { label: "Submissions",  path: "/submissions",   icon: FileText,        description: "Your submitted work"         },
    { label: "Attendance",   path: "/attendance",    icon: ClipboardCheck,  description: "Your attendance record"      },
    { label: "Notifications",path: "/notifications", icon: Bell,            description: "Alerts & updates"            },
    { label: "Daily Reports",path: "/daily-reports", icon: ClipboardList,   description: "Submit your daily report"    },
    { label: "Activity Feed",path: "/activity-feed", icon: Activity,        description: "Timeline of all actions"     },
  ],
};

// ── Keyboard shortcut hint ────────────────────────────────
const KbdHint = ({ keys }) => (
  <span className="flex items-center gap-1">
    {keys.map((k) => (
      <kbd
        key={k}
        className="
          inline-flex items-center justify-center
          min-w-[20px] h-5 px-1.5
          rounded-md
          bg-white/[0.06] border border-white/[0.08]
          text-[10px] font-medium text-white/30
          font-mono
        "
      >
        {k}
      </kbd>
    ))}
  </span>
);

// ── CommandPalette ────────────────────────────────────────
const CommandPalette = ({ open, onClose }) => {
  const navigate = useNavigate();
  const role     = useAuthStore((state) => state.user?.role);
  const [query,  setQuery]  = useState("");

  const items = NAV_ITEMS[role] ?? [];

  // ── Reset query when closed ──
  useEffect(() => {
    if (!open) setTimeout(() => setQuery(""), 200);
  }, [open]);

  // ── Global ⌘K / Ctrl+K listener ──
  useEffect(() => {
    const handler = (e) => {
      if ((e.metaKey || e.ctrlKey) && e.key === "k") {
        e.preventDefault();
        open ? onClose() : null; // parent toggles open
      }
      if (e.key === "Escape" && open) onClose();
    };
    window.addEventListener("keydown", handler);
    return () => window.removeEventListener("keydown", handler);
  }, [open, onClose]);

  const handleSelect = (path) => {
    navigate(path);
    onClose();
  };

  return (
    <AnimatePresence>
      {open && (
        <>
          {/* ── Backdrop ── */}
          <motion.div
            key="cp-backdrop"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.15 }}
            onClick={onClose}
            className="fixed inset-0 z-50 bg-black/60 backdrop-blur-sm"
          />

          {/* ── Panel ── */}
          <motion.div
            key="cp-panel"
            initial={{ opacity: 0, scale: 0.97, y: -12 }}
            animate={{ opacity: 1, scale: 1,    y: 0   }}
            exit={{    opacity: 0, scale: 0.97, y: -8  }}
            transition={{ duration: 0.18, ease: [0.16, 1, 0.3, 1] }}
            className="
              fixed top-[15%] left-1/2 -translate-x-1/2
              z-50 w-full max-w-[560px] px-4
            "
          >
            <Command
              shouldFilter={true}
              className="
                bg-[#1A1A24]
                border border-white/[0.10]
                rounded-2xl overflow-hidden
                shadow-2xl shadow-black/60
              "
            >
              {/* ── Top accent line ── */}
              <div className="h-px w-full bg-gradient-to-r from-transparent via-[#5B73FF]/50 to-transparent" />

              {/* ── Search input ── */}
              <div className="flex items-center gap-3 px-4 py-3 border-b border-white/[0.06]">
                <Search size={15} className="text-white/25 flex-shrink-0" />
                <CommandInput
                  value={query}
                  onValueChange={setQuery}
                  placeholder="Search pages, actions..."
                  className="
                    flex-1 bg-transparent outline-none border-none
                    text-[14px] text-white/80
                    placeholder:text-white/25
                    caret-[#5B73FF]
                  "
                  autoFocus
                />
                {query && (
                  <button
                    onClick={() => setQuery("")}
                    className="text-white/20 hover:text-white/50 transition-colors text-[11px]"
                  >
                    Clear
                  </button>
                )}
                <KbdHint keys={["Esc"]} />
              </div>

              {/* ── Results ── */}
              <CommandList className="max-h-[360px] overflow-y-auto py-2">

                {/* Empty state */}
                <CommandEmpty>
                  <div className="flex flex-col items-center justify-center py-10 text-center">
                    <div className="
                      w-10 h-10 rounded-xl mb-3
                      bg-white/[0.04] border border-white/[0.06]
                      flex items-center justify-center
                    ">
                      <Hash size={18} className="text-white/20" />
                    </div>
                    <p className="text-[13px] text-white/40 font-medium">No results for</p>
                    <p className="text-[13px] text-white/60 font-semibold mt-0.5">"{query}"</p>
                  </div>
                </CommandEmpty>

                {/* Navigation group */}
                <CommandGroup
                  heading={
                    <span className="
                      px-4 pb-1 pt-2
                      text-[10px] font-semibold
                      text-white/25 uppercase tracking-widest
                      select-none block
                    ">
                      Navigation
                    </span>
                  }
                >
                  {items.map((item) => {
                    const Icon = item.icon;
                    return (
                      <CommandItem
                        key={item.path}
                        value={item.label}
                        onSelect={() => handleSelect(item.path)}
                        className="
                          group
                          flex items-center gap-3
                          mx-2 px-3 py-2.5 rounded-xl
                          cursor-pointer
                          text-white/60
                          data-[selected=true]:bg-[#5B73FF]/15
                          data-[selected=true]:text-white/90
                          transition-colors duration-100
                          outline-none
                        "
                      >
                        {/* Icon badge */}
                        <div className="
                          flex items-center justify-center
                          w-7 h-7 rounded-lg flex-shrink-0
                          bg-white/[0.05]
                          group-data-[selected=true]:bg-[#5B73FF]/20
                          transition-colors duration-100
                        ">
                          <Icon
                            size={14}
                            className="
                              text-white/30
                              group-data-[selected=true]:text-[#5B73FF]
                              transition-colors duration-100
                            "
                          />
                        </div>

                        {/* Label + description */}
                        <div className="flex-1 min-w-0">
                          <p className="text-[13px] font-medium leading-none">
                            {item.label}
                          </p>
                          <p className="text-[11px] text-white/30 mt-0.5 leading-none truncate">
                            {item.description}
                          </p>
                        </div>

                        {/* Arrow — shows on selected */}
                        <ArrowRight
                          size={13}
                          className="
                            text-white/0
                            group-data-[selected=true]:text-[#5B73FF]/60
                            transition-colors duration-100
                            flex-shrink-0
                          "
                        />
                      </CommandItem>
                    );
                  })}
                </CommandGroup>
              </CommandList>

              {/* ── Footer hint bar ── */}
              <div className="
                flex items-center justify-between
                px-4 py-2.5
                border-t border-white/[0.05]
                bg-white/[0.02]
              ">
                <div className="flex items-center gap-4">
                  <span className="flex items-center gap-1.5 text-[11px] text-white/25">
                    <KbdHint keys={["↑", "↓"]} />
                    Navigate
                  </span>
                  <span className="flex items-center gap-1.5 text-[11px] text-white/25">
                    <KbdHint keys={["↵"]} />
                    Open
                  </span>
                  <span className="flex items-center gap-1.5 text-[11px] text-white/25">
                    <KbdHint keys={["Esc"]} />
                    Close
                  </span>
                </div>
                <span className="text-[11px] text-white/20 font-medium">
                  Safarian CRM
                </span>
              </div>
            </Command>
          </motion.div>
        </>
      )}
    </AnimatePresence>
  );
};

export default CommandPalette;