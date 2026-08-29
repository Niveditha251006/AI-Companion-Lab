import { useEffect, useState } from "react";
import "../styles/AchievementCard.css";

import {
  checkAchievements,
} from "../utils/achievements";

import type {
  Achievement,
} from "../utils/achievements";

function AchievementCard() {
  const [achievements, setAchievements] =
    useState<Achievement[]>([]);

  const [notification, setNotification] =
    useState<Achievement | null>(null);

  const loadAchievements = () => {
    const result =
      checkAchievements();

    setAchievements(
      result.achievements
    );

    // Show notification only
    // for newly unlocked achievements
    if (
      result.newlyUnlocked.length > 0
    ) {
      setNotification(
        result.newlyUnlocked[0]
      );

      setTimeout(() => {
        setNotification(null);
      }, 4000);
    }
  };

  useEffect(() => {
    loadAchievements();

    window.addEventListener(
      "activityUpdated",
      loadAchievements
    );

    window.addEventListener(
      "focus",
      loadAchievements
    );

    return () => {
      window.removeEventListener(
        "activityUpdated",
        loadAchievements
      );

      window.removeEventListener(
        "focus",
        loadAchievements
      );
    };
  }, []);

  const unlockedCount =
    achievements.filter(
      (achievement) =>
        achievement.unlocked
    ).length;

  return (
    <>
      {notification && (
        <div className="achievement-notification">

          <div className="notification-icon">
            {notification.icon}
          </div>

          <div className="notification-content">

            <strong>
              🎉 Achievement Unlocked!
            </strong>

            <h3>
              {notification.title}
            </h3>

            <p>
              {notification.description}
            </p>

          </div>

        </div>
      )}

      <div className="achievement-card">

        <div className="achievement-header">

          <div>
            <h2>
              🏆 Achievements
            </h2>

            <p>
              {unlockedCount}/
              {achievements.length} unlocked
            </p>
          </div>

        </div>

        <div className="achievement-grid">

          {achievements.map(
            (achievement) => (

              <div
                key={achievement.id}
                className={
                  achievement.unlocked
                    ? "achievement unlocked"
                    : "achievement locked"
                }
              >

                <div className="achievement-icon">
                  {achievement.icon}
                </div>

                <div className="achievement-info">

                  <h3>
                    {achievement.title}
                  </h3>

                  <p>
                    {achievement.description}
                  </p>

                </div>

                <span className="achievement-status">
                  {achievement.unlocked
                    ? "✅"
                    : "🔒"}
                </span>

              </div>

            )
          )}

        </div>

      </div>
    </>
  );
}

export default AchievementCard;