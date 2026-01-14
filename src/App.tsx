import { BrowserRouter, Routes, Route, Navigate, Outlet } from "react-router-dom";
import { Toaster } from "sonner";
import { AppShell } from "@/components/layout/AppShell";
import { DashboardPage } from "@/features/dashboard/pages/DashboardPage";
import { ClientsPage } from "@/features/clients/pages/ClientsPage";
import { ProjectsPage } from "@/features/projects/pages/ProjectsPage";
import { TasksPage } from "@/features/tasks/pages/TasksPage";
import { RecordPage } from "@/components/records/RecordPage";
import { LoginPage } from "@/features/auth/pages/LoginPage";
import { OnboardingPage } from "@/features/onboarding/pages/OnboardingPage";
import { AcceptInvitePage } from "@/features/onboarding/pages/AcceptInvitePage";
import { SignupPage } from "@/features/auth/pages/SignupPage";
import { useAuth } from "@/features/auth/hooks/useAuth";
import { useWorkspace } from "@/hooks/useWorkspace";
import { WorkspaceProvider } from "@/context/WorkspaceContext";
import { Loader2 } from "lucide-react";

function ProtectedRoute() {
  const { user, loading: authLoading } = useAuth();
  const { workspace, loading: workspaceLoading } = useWorkspace();

  if (authLoading || workspaceLoading) {
    return (
      <div className="h-screen w-full flex items-center justify-center">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    );
  }

  if (!user) {
    return <Navigate to="/login" replace />;
  }

  // Redirect to onboarding if no workspace
  if (!workspace) {
    return <Navigate to="/onboarding" replace />;
  }

  return (
    <AppShell>
      <Outlet />
    </AppShell>
  );
}

function App() {
  return (
    <BrowserRouter>
      <Toaster position="top-center" richColors />
      <WorkspaceProvider>
        <Routes>
          <Route path="/login" element={<LoginPage />} />
          <Route path="/signup" element={<SignupPage />} />
          <Route path="/onboarding" element={<OnboardingPage />} />
          <Route path="/invite/:token" element={<AcceptInvitePage />} />
          
          <Route element={<ProtectedRoute />}>
            <Route path="/" element={<DashboardPage />} />
            <Route path="/clients" element={<ClientsPage />} />
            <Route path="/projects" element={<ProjectsPage />} />
            <Route path="/tasks" element={<TasksPage />} />
            <Route path="/tasks/:taskId" element={<RecordPage />} />
          </Route>
        </Routes>
      </WorkspaceProvider>
    </BrowserRouter>
  );
}

export default App;
