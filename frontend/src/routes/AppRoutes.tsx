import { BrowserRouter, Routes, Route } from "react-router-dom";

import LandingPage from "../pages/LandingPage";
import LoginPage from "../pages/LoginPage";
import DashboardPage from "../pages/DashboardPage";
import PromptLabPage from "../pages/PromptLabPage";
import ChatAnalyzerPage from "../pages/ChatAnalyzerPage";
import LearningPage from "../pages/LearningPage";
import ProfilePage from "../pages/ProfilePage";

function AppRoutes() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<LandingPage />} />
        <Route path="/login" element={<LoginPage />} />
        <Route path="/dashboard" element={<DashboardPage />} />
        <Route path="/prompt-lab" element={<PromptLabPage />} />
        <Route path="/chat-analyzer" element={<ChatAnalyzerPage />} />
        <Route path="/learning" element={<LearningPage />} />
        <Route path="/profile" element={<ProfilePage />} />
      </Routes>
    </BrowserRouter>
  );
}

export default AppRoutes;