import { useEffect, useState } from "react";
import "../styles/StreakCard.css";

function StreakCard() {
  const [streak, setStreak] =
    useState(0);

  const loadStreak = () => {
    const savedStreak =
      Number(
        localStorage.getItem(
          "streak"
        )
      ) || 0;

    const lastActiveDate =
      localStorage.getItem(
        "lastActiveDate"
      );

    const today =
      new Date().toDateString();

    if (!lastActiveDate) {
      setStreak(0);
      return;
    }

    if (
      lastActiveDate === today
    ) {
      setStreak(savedStreak);
      return;
    }

    const yesterday =
      new Date();

    yesterday.setDate(
      yesterday.getDate() - 1
    );

    if (
      lastActiveDate ===
      yesterday.toDateString()
    ) {
      setStreak(savedStreak);
    } else {
      localStorage.setItem(
        "streak",
        "0"
      );

      setStreak(0);
    }
  };

  useEffect(() => {
    loadStreak();

    window.addEventListener(
      "activityUpdated",
      loadStreak
    );

    window.addEventListener(
      "focus",
      loadStreak
    );

    return () => {
      window.removeEventListener(
        "activityUpdated",
        loadStreak
      );

      window.removeEventListener(
        "focus",
        loadStreak
      );
    };
  }, []);

  return (
    <div className="streak-card">

      <h2>
        🔥 Daily Streak
      </h2>

      <h1>
        {streak} Days
      </h1>

      {streak === 0 ? (
        <p>
          Start learning today! 🚀
        </p>
      ) : (
        <p>
          Keep learning every day! 🔥
        </p>
      )}

    </div>
  );
}

export default StreakCard;