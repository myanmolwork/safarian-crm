import { useEffect } from "react";
import { useLocation } from "react-router-dom";
import Sidebar    from "../components/dashboard/Sidebar";
import Topbar     from "../components/dashboard/Topbar";
import useUIStore from "../store/uiStore";

const DashboardLayout = ({ children }) => {
  const location     = useLocation();
  const closeSidebar = useUIStore((state) => state.closeSidebar);
  const sidebarOpen  = useUIStore((state) => state.sidebarOpen);

  // ── Close mobile sidebar on every route change ──
  useEffect(() => {
    closeSidebar();
  }, [location.pathname, closeSidebar]); // ✅ ESLint satisfied

  return (
    <div className="
      flex h-screen overflow-hidden
      bg-[#0A0A0F] text-white
    ">
      {/* ── Sidebar ── */}
      <Sidebar />

      {/* ── Mobile backdrop ── */}
      {sidebarOpen && (
        <div
          onClick={closeSidebar}
          aria-hidden="true"
          className="
            fixed inset-0 z-40
            bg-black/60 backdrop-blur-sm
            md:hidden
          "
        />
      )}

      {/* ── Right column ── */}
      <div className="
        relative flex flex-col flex-1
        min-w-0 overflow-hidden
      ">
        <Topbar />

        <main className="
          flex-1
          overflow-y-auto overflow-x-hidden
          px-5 py-6
          md:px-8 md:py-7
          scroll-smooth
        ">
          <div className="max-w-[1440px] mx-auto w-full">
            {children}
          </div>
        </main>
      </div>
    </div>
  );
};

export default DashboardLayout;