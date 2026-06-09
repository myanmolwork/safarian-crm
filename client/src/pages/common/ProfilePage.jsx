import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  User,
  Mail,
  Shield,
  Briefcase,
  Calendar,
  Bell,
  Moon,
  Globe,
  Lock,
  CheckCircle,
  Loader2,
  ChevronRight,
  LogOut,            // ✅ added missing import
} from "lucide-react";
import DashboardLayout from "../../layouts/DashboardLayout";
import useAuthStore    from "../../store/authStore";
import RoleBadge       from "../../components/shared/RoleBadge";

// ── Role labels ───────────────────────────────────────────
const roleLabels = {
  BOSS:        "Administrator",
  TEAM_LEADER: "Team Leader",
  WORKER:      "Team Member",
};

// ── Section wrapper ───────────────────────────────────────
const Section = ({ title, subtitle, children }) => (
  <div className="bg-[#1A1A24] border border-white/[0.07] rounded-xl overflow-hidden">
    <div className="px-6 py-4 border-b border-white/[0.05]">
      <h2 className="text-[14px] font-semibold text-white/90 leading-none">
        {title}
      </h2>
      {subtitle && (
        <p className="text-[12px] text-white/35 mt-1 leading-none">{subtitle}</p>
      )}
    </div>
    <div className="px-6 py-5">{children}</div>
  </div>
);

// ── Info row ──────────────────────────────────────────────
const InfoRow = ({ icon: Icon, label, value }) => (
  <div className="flex items-center gap-4 py-3 border-b border-white/[0.04] last:border-0">
    <div className="
      w-8 h-8 rounded-lg flex-shrink-0
      bg-white/[0.04] border border-white/[0.06]
      flex items-center justify-center
    ">
      <Icon size={14} className="text-white/30" />
    </div>
    <div className="flex-1 min-w-0">
      <p className="text-[11px] font-semibold text-white/30 uppercase tracking-widest leading-none mb-1">
        {label}
      </p>
      <p className="text-[13px] font-medium text-white/75 truncate leading-none">
        {value ?? "—"}
      </p>
    </div>
  </div>
);

// ── Toggle row ────────────────────────────────────────────
const ToggleRow = ({ icon: Icon, label, sub, enabled, onChange }) => (
  <div className="flex items-center gap-4 py-3 border-b border-white/[0.04] last:border-0">
    <div className="
      w-8 h-8 rounded-lg flex-shrink-0
      bg-white/[0.04] border border-white/[0.06]
      flex items-center justify-center
    ">
      <Icon size={14} className="text-white/30" />
    </div>
    <div className="flex-1 min-w-0">
      <p className="text-[13px] font-medium text-white/75 leading-none">{label}</p>
      {sub && <p className="text-[11px] text-white/30 mt-0.5 leading-none">{sub}</p>}
    </div>
    <button
      onClick={() => onChange(!enabled)}
      className={`
        relative w-9 h-5 rounded-full flex-shrink-0
        transition-colors duration-200
        ${enabled ? "bg-[#5B73FF]" : "bg-white/[0.10]"}
      `}
    >
      <span className={`
        absolute top-0.5 left-0.5
        w-4 h-4 rounded-full bg-white
        shadow-sm transition-transform duration-200
        ${enabled ? "translate-x-4" : "translate-x-0"}
      `} />
    </button>
  </div>
);

// ── Setting row ───────────────────────────────────────────
const SettingRow = ({ icon: Icon, label, sub, value, onClick, danger }) => (
  <button
    onClick={onClick}
    className="
      w-full flex items-center gap-4
      py-3 border-b border-white/[0.04] last:border-0
      hover:bg-white/[0.02] -mx-6 px-6
      transition-colors duration-100
      group text-left
    "
  >
    <div className={`
      w-8 h-8 rounded-lg flex-shrink-0
      flex items-center justify-center
      ${danger
        ? "bg-[#F43F5E]/10 border border-[#F43F5E]/15"
        : "bg-white/[0.04] border border-white/[0.06]"
      }
    `}>
      <Icon size={14} className={danger ? "text-[#F43F5E]" : "text-white/30"} />
    </div>
    <div className="flex-1 min-w-0">
      <p className={`
        text-[13px] font-medium leading-none
        ${danger ? "text-[#F43F5E]" : "text-white/75"}
      `}>
        {label}
      </p>
      {sub && (
        <p className="text-[11px] text-white/30 mt-0.5 leading-none">{sub}</p>
      )}
    </div>
    {value && (
      <span className="text-[11px] text-white/30 flex-shrink-0">{value}</span>
    )}
    <ChevronRight
      size={13}
      className={`
        flex-shrink-0 transition-colors
        ${danger
          ? "text-[#F43F5E]/40"
          : "text-white/15 group-hover:text-white/40"
        }
      `}
    />
  </button>
);

// ── ProfilePage ───────────────────────────────────────────
const ProfilePage = () => {
  const user   = useAuthStore((state) => state.user);
  const logout = useAuthStore((state) => state.logout);

  const [notifEnabled, setNotifEnabled] = useState(true);
  const [darkMode,     setDarkMode]     = useState(true);
  const [saveStatus,   setSaveStatus]   = useState("idle");

  const initials = user?.name
    ? user.name.split(" ").map((n) => n[0]).join("").slice(0, 2).toUpperCase()
    : "??";

  const joinedDate = user?.createdAt
    ? new Date(user.createdAt).toLocaleDateString("en-US", {
        month: "long", day: "numeric", year: "numeric",
      })
    : "—";

  const handleSave = async () => {
    setSaveStatus("saving");
    await new Promise((r) => setTimeout(r, 1000));
    setSaveStatus("saved");
    setTimeout(() => setSaveStatus("idle"), 2500);
  };

  return (
    <DashboardLayout>
      <div className="max-w-2xl mx-auto">

        {/* ── Page header ── */}
        <div className="flex items-start justify-between mb-8">
          <div>
            <p className="text-[11px] font-semibold text-white/30 uppercase tracking-widest mb-1">
              Account
            </p>
            <h1 className="text-[22px] font-semibold text-white/90 leading-tight">
              Profile & Settings
            </h1>
            <p className="text-[13px] text-white/35 mt-1">
              Manage your account information and preferences.
            </p>
          </div>
        </div>

        {/* ── Profile hero card ── */}
        <div className="
          bg-[#1A1A24] border border-white/[0.07]
          rounded-xl p-6 mb-6
          flex items-center gap-5
        ">
          <div className="relative flex-shrink-0">
            <div className="
              w-16 h-16 rounded-2xl
              bg-[#5B73FF]/20 text-[#5B73FF]
              flex items-center justify-center
              text-[22px] font-bold
              border border-[#5B73FF]/25
            ">
              {initials}
            </div>
            <span className="
              absolute -bottom-1 -right-1
              w-4 h-4 rounded-full
              bg-[#22C97B] border-2 border-[#1A1A24]
            " />
          </div>

          <div className="flex-1 min-w-0">
            <div className="flex items-center gap-3 flex-wrap mb-1">
              <h2 className="text-[18px] font-semibold text-white/90 leading-none">
                {user?.name ?? "User"}
              </h2>
              <RoleBadge role={user?.role} />
            </div>
            <p className="text-[13px] text-white/40 leading-none mt-1.5">
              {user?.email ?? "—"}
            </p>
            <p className="text-[11px] text-white/25 mt-1.5 flex items-center gap-1.5">
              <Calendar size={10} />
              Member since {joinedDate}
            </p>
          </div>

          <div className="hidden sm:flex flex-col items-end gap-1 flex-shrink-0">
            <span className="flex items-center gap-1.5 text-[12px] font-medium text-[#22C97B]">
              <span className="w-1.5 h-1.5 rounded-full bg-[#22C97B]" />
              Online
            </span>
            <span className="text-[11px] text-white/25">
              {roleLabels[user?.role] ?? ""}
            </span>
          </div>
        </div>

        <div className="space-y-4">

          <Section
            title="Personal Information"
            subtitle="Your account details and identity"
          >
            <InfoRow icon={User}      label="Full Name"   value={user?.name}  />
            <InfoRow icon={Mail}      label="Email"       value={user?.email} />
            <InfoRow icon={Shield}    label="Role"        value={roleLabels[user?.role]} />
            <InfoRow icon={Briefcase} label="Department"  value={user?.team?.teamName ?? "Not assigned"} />
            <InfoRow icon={Calendar}  label="Joined"      value={joinedDate}  />
          </Section>

          <Section
            title="Preferences"
            subtitle="Customize your workspace experience"
          >
            <ToggleRow
              icon={Bell}
              label="Push Notifications"
              sub="Get notified about task updates and mentions"
              enabled={notifEnabled}
              onChange={setNotifEnabled}
            />
            <ToggleRow
              icon={Moon}
              label="Dark Mode"
              sub="Use dark theme across the interface"
              enabled={darkMode}
              onChange={setDarkMode}
            />
          </Section>

          <Section
            title="Account"
            subtitle="Security and account management"
          >
            <SettingRow
              icon={Lock}
              label="Change Password"
              sub="Update your login credentials"
              onClick={() => {}}
            />
            <SettingRow
              icon={Globe}
              label="Language & Region"
              sub="Set your preferred language"
              value="English"
              onClick={() => {}}
            />
            <SettingRow
              icon={Bell}
              label="Notification Settings"
              sub="Configure which events notify you"
              onClick={() => {}}
            />
          </Section>

          <Section
            title="Danger Zone"
            subtitle="Irreversible account actions"
          >
            <SettingRow
              icon={LogOut}
              label="Sign Out"
              sub="Log out of your current session"
              onClick={logout}
              danger
            />
          </Section>

        </div>

        {/* ── Save bar ── */}
        <AnimatePresence>
          {saveStatus !== "idle" && (
            <motion.div
              initial={{ opacity: 0, y: 16 }}
              animate={{ opacity: 1, y: 0  }}
              exit={{    opacity: 0, y: 16 }}
              className="
                fixed bottom-6 left-1/2 -translate-x-1/2
                flex items-center gap-3
                px-4 py-3 rounded-xl
                bg-[#1A1A24] border border-white/[0.12]
                shadow-2xl shadow-black/50
                z-50
              "
            >
              {saveStatus === "saving" && (
                <>
                  <Loader2 size={14} className="animate-spin text-[#5B73FF]" />
                  <span className="text-[13px] text-white/70">Saving changes…</span>
                </>
              )}
              {saveStatus === "saved" && (
                <>
                  <CheckCircle size={14} className="text-[#22C97B]" />
                  <span className="text-[13px] text-white/70">Changes saved</span>
                </>
              )}
            </motion.div>
          )}
        </AnimatePresence>

      </div>
    </DashboardLayout>
  );
};

export default ProfilePage; // ✅ fixed typo: "dfixefault" → "default"