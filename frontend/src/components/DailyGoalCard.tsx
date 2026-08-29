import { useEffect, useState } from "react";
import "../styles/DailyGoalCard.css";

type Goals = {
  lesson: boolean;
  prompts: boolean;
  xp: boolean;
};

const defaultGoals: Goals = {
  lesson: false,
  prompts: false,
  xp: false,
};

function DailyGoalCard() {
  const [goals, setGoals] =
    useState<Goals>(
      defaultGoals
    );

  const loadGoals = () => {
    const today =
      new Date().toDateString();

    const savedDate =
      localStorage.getItem(
        "dailyGoalsDate"
      );

    // New day
    if (
      savedDate !== today
    ) {
      const newGoals = {
        ...defaultGoals,
      };

      localStorage.setItem(
        "dailyGoalsDate",
        today
      );

      localStorage.setItem(
        "dailyGoals",
        JSON.stringify(
          newGoals
        )
      );

      setGoals(newGoals);

      return;
    }

    const savedGoals =
      localStorage.getItem(
        "dailyGoals"
      );

    if (!savedGoals) {
      setGoals({
        ...defaultGoals,
      });

      return;
    }

    try {
      const parsed =
        JSON.parse(
          savedGoals
        );

      setGoals({
        lesson: Boolean(
          parsed.lesson
        ),
        prompts: Boolean(
          parsed.prompts
        ),
        xp: Boolean(
          parsed.xp
        ),
      });
    } catch {
      setGoals({
        ...defaultGoals,
      });
    }
  };

  useEffect(() => {
    loadGoals();

    window.addEventListener(
      "activityUpdated",
      loadGoals
    );

    window.addEventListener(
      "focus",
      loadGoals
    );

    return () => {
      window.removeEventListener(
        "activityUpdated",
        loadGoals
      );

      window.removeEventListener(
        "focus",
        loadGoals
      );
    };
  }, []);

  const completedGoals =
    Object.values(
      goals
    ).filter(Boolean).length;

  return (
    <div className="daily-goal-card">

      <h2>
        🎯 Today's Goals
      </h2>

      <p>
        {completedGoals}/3 goals completed
      </p>

      <ul>

        <li
          className={
            goals.lesson
              ? "completed"
              : ""
          }
        >
          {goals.lesson
            ? "☑"
            : "☐"}{" "}
          Complete 1 Lesson
        </li>

        <li
          className={
            goals.prompts
              ? "completed"
              : ""
          }
        >
          {goals.prompts
            ? "☑"
            : "☐"}{" "}
          Improve 3 Prompts
        </li>

        <li
          className={
            goals.xp
              ? "completed"
              : ""
          }
        >
          {goals.xp
            ? "☑"
            : "☐"}{" "}
          Earn 20 XP
        </li>

      </ul>

    </div>
  );
}

export default DailyGoalCard;