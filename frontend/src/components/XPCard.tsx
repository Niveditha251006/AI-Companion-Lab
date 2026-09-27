import "../styles/XPCard.css";

import {
  getCurrentLevel,
  getNextLevel,
  getLevelProgress,
  getXPToNextLevel,
} from "../utils/xp";

type XPCardProps = {
  xp: number;
};

function XPCard({ xp }: XPCardProps) {

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