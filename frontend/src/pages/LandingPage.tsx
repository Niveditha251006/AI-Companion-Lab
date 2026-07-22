import Navbar from "../components/Navbar";
import Hero from "../components/Hero";
import FeatureCard from "../components/FeatureCard";
import Footer from "../components/Footer";

function LandingPage() {
  return (
    <>
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

      <Footer />
    </>
  );
}

export default LandingPage;