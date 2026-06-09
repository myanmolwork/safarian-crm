import { Route, Routes } from "react-router-dom";
import BossDashboard from "../pages/boss/BossDashboard";
import LeaderDashboard from "../pages/leader/LeaderDashboard";
import WorkerDashboard from "../pages/worker/WorkerDashboard";
import ProtectedRoute from "./ProtectedRoute";
import LoginPage from "../pages/auth/LoginPage";
import TeamsPage from "../pages/boss/TeamsPage";
import EmployeesPage from "../pages/boss/EmployeesPage";
import TasksPage from "../pages/boss/TasksPage";
import AttendancePage from "../pages/boss/AttendancePage";
import NotificationsPage from "../pages/boss/NotificationsPage";
import SubmissionsPage from "../pages/boss/SubmissionsPage";
import DailyReportsPage from "../pages/boss/DailyReportsPage";
import WorkerDailyReportPage from "../pages/worker/DailyReportPage";
import ActivityTimelinePage from "../pages/boss/ActivityTimelinePage";
import useAuthStore from "../store/authStore";
import ProfilePage from "../pages/common/ProfilePage";
import SettingsPage from "../pages/common/SettingsPage";

const AppRoutes = () =>
{
    const role = useAuthStore(
      (state) => state.user?.role
    );

    const DashboardPage = {
      BOSS: BossDashboard,
      TEAM_LEADER: LeaderDashboard,
      WORKER: WorkerDashboard,
    }[role] || WorkerDashboard;

    return (
        <Routes>
          {/* Login Route */}
      <Route
        path="/login"
        element={<LoginPage />}
      />
          <Route
        path="/"
        element={
          <ProtectedRoute>
            <DashboardPage />
          </ProtectedRoute>
        }
      />
  <Route
        path="/teams"
        element={
          <ProtectedRoute>
            <TeamsPage />
          </ProtectedRoute>
        }
      />

      <Route
        path="/employees"
        element={
          <ProtectedRoute>
            <EmployeesPage />
          </ProtectedRoute>
        }
      />

      <Route
        path="/tasks"
        element={
          <ProtectedRoute>
            <TasksPage />
          </ProtectedRoute>
        }
      />

      <Route
        path="/attendance"
        element={
          <ProtectedRoute>
            <AttendancePage />
          </ProtectedRoute>
        }
      />

      <Route
        path="/notifications"
        element={
          <ProtectedRoute>
            <NotificationsPage />
          </ProtectedRoute>
        }
      />
      <Route
        path="/submissions"
        element={
        <ProtectedRoute>
          <SubmissionsPage />
        </ProtectedRoute>
        }
      />
      <Route
  path="/daily-reports"
  element={
    <ProtectedRoute>
      {role === "WORKER"
        ? <WorkerDailyReportPage />
        : <DailyReportsPage />}
    </ProtectedRoute>
  }
/>

<Route
  path="/activity-feed"
  element={
    <ProtectedRoute>
      <ActivityTimelinePage />
    </ProtectedRoute>
  }
/>

<Route
  path="/profile"
  element={
    <ProtectedRoute>
      <ProfilePage />
    </ProtectedRoute>
  }
/>

<Route
  path="/settings"
  element={
    <ProtectedRoute>
      <SettingsPage />
    </ProtectedRoute>
  }
/>
        </Routes>
    );
};

export default AppRoutes;
