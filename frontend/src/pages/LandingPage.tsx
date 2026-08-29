import { useNavigate } from "react-router-dom";

import Navbar from "../components/Navbar";
import Hero from "../components/Hero";
import FeatureCard from "../components/FeatureCard";
import Footer from "../components/Footer";
import "../styles/LandingPage.css";

function LandingPage() {
  const navigate = useNavigate();

  return (
    <div className="landing-page">

      <Navbar />

      <Hero />

      <div className="features">

        <FeatureCard
          title="🤖 Prompt Lab"
          description="Learn prompt engineering with real-world practice."
        />

        <FeatureCard
          title="🔍 Chat Analyzer"
          description="Analyze AI conversations and improve your communication."
        />

        <FeatureCard
          title="📚 Learning Tracker"
          description="Track your progress and build your AI skills."
        />

      </div>

      <div className="landing-actions">

        <button onClick={() => navigate("/login")}>
          🚀 Get Started
        </button>

        <button onClick={() => navigate("/login")}>
          🔐 Login
        </button>

      </div>

      <Footer />

    </div>
  );
}

export default LandingPage;