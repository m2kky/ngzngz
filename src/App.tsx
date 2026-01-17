import { BrowserRouter, Routes, Route, Navigate, Outlet } from "react-router-dom";
import { Toaster } from "sonner";
import { AppShell } from "@/components/layout/AppShell";
import { DashboardPage } from "@/features/dashboard/pages/DashboardPage";
import { ClientsPage } from "@/features/clients/pages/ClientsPage";
import { ProjectsPage } from "@/features/projects/pages/ProjectsPage";
import { TasksPage } from "@/features/tasks/pages/TasksPage";
import { MeetingsPage } from "@/features/meetings/pages/MeetingsPage";
import { StrategyPage } from "@/features/strategy/pages/StrategyPage";
import { BrandKitPage } from "@/features/brand-kit/pages/BrandKitPage";
import { BrandKitDetailPage } from "@/features/brand-kit/pages/BrandKitDetailPage";
import { AdsLandingPage } from "@/features/ads/pages/AdsLandingPage";
import { ClientAdsPage } from "@/features/ads/pages/ClientAdsPage";
import { RecordPage } from "@/components/records/RecordPage";
import { TeamSettingsPage } from "@/features/settings/pages/TeamSettings";
import { LoginPage } from "@/features/auth/pages/LoginPage";
import { OnboardingPage } from "@/features/onboarding/pages/OnboardingPage";
import { AcceptInvitePage } from "@/features/onboarding/pages/AcceptInvitePage";
import { SignupPage } from "@/features/auth/pages/SignupPage";
import { useAuth } from "@/features/auth/hooks/useAuth";
import { useWorkspace } from "@/hooks/useWorkspace";
import { WorkspaceProvider } from "@/context/WorkspaceContext";
import { RBACProvider } from "@/features/auth/context/RBACContext";
import { Loader2 } from "lucide-react";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";

const queryClient = new QueryClient();

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
    <RBACProvider>
      <AppShell>
        <Outlet />
      </AppShell>
    </RBACProvider>
  );
}

function App() {
  return (
    <QueryClientProvider client={queryClient}>
      <BrowserRouter>
        <Toaster position="top-center" richColors toastOptions={{ style: { zIndex: 99999 } }} />
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
              <Route path="/meetings" element={<MeetingsPage />} />
              <Route path="/strategy" element={<StrategyPage />} />
              <Route path="/brand-kits" element={<BrandKitPage />} />
              <Route path="/brand-kits/:id" element={<BrandKitDetailPage />} />
              <Route path="/ads" element={<AdsLandingPage />} />
              <Route path="/ads/:clientId" element={<ClientAdsPage />} />
              <Route path="/tasks/:taskId" element={<RecordPage />} />
              <Route path="/settings" element={<TeamSettingsPage />} />
            </Route>
          </Routes>
        </WorkspaceProvider>
      </BrowserRouter>
    </QueryClientProvider>
  );
}

export default App;
