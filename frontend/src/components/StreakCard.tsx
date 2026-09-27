import "../styles/StreakCard.css";

type StreakCardProps = {
  streak: number;
};

function StreakCard({
  streak,
}: StreakCardProps) {

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