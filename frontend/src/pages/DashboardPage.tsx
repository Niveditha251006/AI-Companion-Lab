import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import "../styles/DashboardPage.css";

import WelcomeBanner from "../components/WelcomeBanner";
import DashboardCard from "../components/DashboardCard";
import DailyGoalCard from "../components/DailyGoalCard";
import StreakCard from "../components/StreakCard";
import XPCard from "../components/XPCard";
import AchievementCard from "../components/AchievementCard";

type DashboardData = {
  user: {
    id: number;
    name: string;
    email: string;
  };

  statistics: {
    prompt_count: number;
    completed_courses: number;
    overall_progress: number;
    xp: number;
    streak: number;
  };
};

const API_BASE_URL =
  "http://127.0.0.1:5000/api";


function DashboardPage() {

  const navigate = useNavigate();

  const [userName, setUserName] =
    useState("User");

  const [xp, setXP] =
    useState(0);

  const [streak, setStreak] =
    useState(0);

  const [promptCount, setPromptCount] =
    useState(0);

  const [completedCourses, setCompletedCourses] =
    useState(0);

  const [overallProgress, setOverallProgress] =
    useState(0);

  const [loading, setLoading] =
    useState(true);

  const [error, setError] =
    useState("");


  // =========================================================
  // USER ID
  // =========================================================

  const userId =
    localStorage.getItem("userId") || "";


  // =========================================================
  // LOAD DASHBOARD DATA
  // =========================================================

  const loadDashboardData = async () => {

    if (!userId) {

      setError(
        "User ID not found. Please login again."
      );

      setLoading(false);

      return;
    }

    try {

      setLoading(true);

      setError("");

      const response = await fetch(
        `${API_BASE_URL}/dashboard/${userId}`
      );

      const data: DashboardData =
        await response.json();

      if (!response.ok) {

        throw new Error(
          data &&
          "message" in data
            ? String(
                (
                  data as any
                ).message
              )
            : "Failed to load dashboard data."
        );
      }


      // =====================================================
      // USER
      // =====================================================

      setUserName(
        data.user?.name || "User"
      );


      // Keep localStorage username
      // synchronized for other pages

      localStorage.setItem(
        "userName",
        data.user?.name || "User"
      );


      // =====================================================
      // STATISTICS
      // =====================================================

      const statistics =
        data.statistics;


      setPromptCount(
        Number(
          statistics?.prompt_count || 0
        )
      );


      setCompletedCourses(
        Number(
          statistics?.completed_courses || 0
        )
      );


      setOverallProgress(
        Number(
          statistics?.overall_progress || 0
        )
      );


      setXP(
        Number(
          statistics?.xp || 0
        )
      );


      setStreak(
        Number(
          statistics?.streak || 0
        )
      );


      console.log(
        "✅ Dashboard data loaded:",
        data
      );

    } catch (error) {

      console.error(
        "❌ Dashboard error:",
        error
      );

      setError(
        error instanceof Error
          ? error.message
          : "Unable to load dashboard."
      );

    } finally {

      setLoading(false);

    }
  };


  // =========================================================
  // LOAD WHEN PAGE OPENS
  // =========================================================

  useEffect(() => {

    loadDashboardData();

    const handleFocus = () => {
      loadDashboardData();
    };

    window.addEventListener(
      "focus",
      handleFocus
    );

    return () => {

      window.removeEventListener(
        "focus",
        handleFocus
      );

    };

  }, [userId]);


  // =========================================================
  // LOADING
  // =========================================================

  if (loading) {

    return (
      <div className="dashboard-page">

        <div className="dashboard-loading">

          <h2>
            ⏳ Loading Dashboard...
          </h2>

          <p>
            Fetching your latest learning
            progress.
          </p>

        </div>

      </div>
    );
  }


  // =========================================================
  // ERROR
  // =========================================================

  if (error) {

    return (
      <div className="dashboard-page">

        <div className="dashboard-error">

          <h2>
            ❌ Unable to Load Dashboard
          </h2>

          <p>
            {error}
          </p>

          <button
            onClick={loadDashboardData}
          >
            🔄 Try Again
          </button>

        </div>

      </div>
    );
  }


  // =========================================================
  // PAGE
  // =========================================================

  return (

    <div className="dashboard-page">

      {/* =====================================================
          WELCOME
      ===================================================== */}

      <WelcomeBanner
        name={userName}
      />


      {/* =====================================================
          QUICK ACTIONS
      ===================================================== */}

      <section className="quick-actions">

        <h2>
          ⚡ Quick Actions
        </h2>

        <div className="dashboard-grid">

          <DashboardCard
            icon="🧠"
            title="Prompt Lab"
            description="Improve your AI prompts"
            onClick={() =>
              navigate("/prompt-lab")
            }
          />

          <DashboardCard
            icon="🔍"
            title="Chat Analyzer"
            description="Analyze AI conversations"
            onClick={() =>
              navigate("/chat-analyzer")
            }
          />

          <DashboardCard
            icon="📚"
            title="Learning Hub"
            description="Continue your courses"
            onClick={() =>
              navigate("/learning")
            }
          />

          <DashboardCard
            icon="👤"
            title="Profile"
            description="View your profile"
            onClick={() =>
              navigate("/profile")
            }
          />

        </div>

      </section>


      {/* =====================================================
          LIVE STATISTICS
      ===================================================== */}

      <section className="dashboard-stats">

        <DashboardCard
          icon="🧠"
          title="Prompts Improved"
          description={`${promptCount} prompts`}
        />

        <DashboardCard
          icon="🔥"
          title="Learning Streak"
          description={`${streak} days`}
        />

        <DashboardCard
          icon="⭐"
          title="Total XP"
          description={`${xp} XP`}
        />

        <DashboardCard
          icon="🏆"
          title="Courses Completed"
          description={`${completedCourses}`}
        />

      </section>


      {/* =====================================================
          OVERALL PROGRESS
      ===================================================== */}

      <section className="dashboard-progress">

        <h2>
          📈 Overall Learning Progress
        </h2>

        <div className="progress-bar">

          <div
            className="progress-fill"
            style={{
              width: `${Math.min(
                Math.max(
                  overallProgress,
                  0
                ),
                100
              )}%`,
            }}
          />

        </div>

        <p>
          {overallProgress.toFixed(1)}
          % Completed
        </p>

      </section>


      {/* =====================================================
          GAMIFICATION
      ===================================================== */}

      <section className="dashboard-gamification">

        <StreakCard />

        <XPCard />

        <DailyGoalCard />

      </section>


      {/* =====================================================
          ACHIEVEMENTS
      ===================================================== */}

      <AchievementCard />

    </div>
  );
}

export default DashboardPage;