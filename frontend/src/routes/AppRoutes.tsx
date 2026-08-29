import { BrowserRouter, Routes, Route } from "react-router-dom";
import RegisterPage from "../pages/RegisterPage";
import LandingPage from "../pages/LandingPage";
import LoginPage from "../pages/LoginPage";
import DashboardPage from "../pages/DashboardPage";
import PromptLabPage from "../pages/PromptLabPage";
import ChatAnalyzerPage from "../pages/ChatAnalyzerPage";
import LearningPage from "../pages/LearningPage";
import ProfilePage from "../pages/ProfilePage";
import AIChatPage from "../pages/AIChatPage";
import InsightPage from "../pages/InsightPage";
import ProtectedRoute from "../components/ProtectedRoute";

function AppRoutes() {
  return (
    <BrowserRouter>
      <Routes>

        {/* Public Pages */}

        <Route path="/" element={<LandingPage />} />

        <Route path="/login" element={<LoginPage />} />

<Route
  path="/register"
  element={<RegisterPage />}
/>
        {/* Protected Pages */}

        <Route
          path="/dashboard"
          element={
            <ProtectedRoute>
              <DashboardPage />
            </ProtectedRoute>
          }
        />

        <Route
          path="/prompt-lab"
          element={
            <ProtectedRoute>
              <PromptLabPage />
            </ProtectedRoute>
          }
        />

        <Route
          path="/chat-analyzer"
          element={
            <ProtectedRoute>
              <ChatAnalyzerPage />
            </ProtectedRoute>
          }
        />

<Route
  path="/ai-chat"
  element={
    <ProtectedRoute>
      <AIChatPage />
    </ProtectedRoute>
  }
/>
      <Route
  path="/insights"
  element={
    <ProtectedRoute>
      <InsightPage />
    </ProtectedRoute>
  }
/>
        <Route
          path="/learning"
          element={
            <ProtectedRoute>
              <LearningPage />
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

      </Routes>
    </BrowserRouter>
  );
}

export default AppRoutes;