import { useEffect, useState } from "react";
import "../styles/XPCard.css";

import {
  getXP,
  getCurrentLevel,
  getNextLevel,
  getLevelProgress,
  getXPToNextLevel,
} from "../utils/xp";

function XPCard() {
  const [xp, setXP] = useState(0);

  const loadXP = () => {
    setXP(getXP());
  };

  useEffect(() => {
    loadXP();

    window.addEventListener("activityUpdated", loadXP);
    window.addEventListener("focus", loadXP);

    return () => {
      window.removeEventListener("activityUpdated", loadXP);
      window.removeEventListener("focus", loadXP);
    };
  }, []);

  const currentLevel = getCurrentLevel(xp);
  const nextLevel = getNextLevel(xp);
  const progress = getLevelProgress(xp);
  const xpNeeded = getXPToNextLevel(xp);

  return (
    <div className="xp-card">
      <h2>⭐ XP Progress</h2>

      <div className="xp-level">
        <span>
          Level {currentLevel.level}
        </span>

        <strong>
          {xp} XP
        </strong>
      </div>

      <div className="xp-progress-bar">
        <div
          className="xp-progress-fill"
          style={{
            width: `${progress}%`,
          }}
        />
      </div>

      <p>
        {nextLevel ? (
          <>
            {xpNeeded} XP needed for Level{" "}
            {nextLevel.level}
          </>
        ) : (
          <>🏆 Maximum Level Reached!</>
        )}
      </p>

      <small>
        {Math.round(progress)}% complete
      </small>
    </div>
  );
}

export default XPCard;