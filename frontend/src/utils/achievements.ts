export type Achievement = {
  id: string;
  title: string;
  description: string;
  icon: string;
  unlocked: boolean;
};

const defaultAchievements: Achievement[] = [
  {
    id: "first-lesson",
    title: "First Step",
    description: "Complete your first lesson",
    icon: "🌱",
    unlocked: false,
  },
  {
    id: "prompt-beginner",
    title: "Prompt Beginner",
    description: "Improve 5 prompts",
    icon: "🧠",
    unlocked: false,
  },
  {
    id: "three-day-streak",
    title: "3-Day Streak",
    description: "Learn for 3 consecutive days",
    icon: "🔥",
    unlocked: false,
  },
  {
    id: "xp-hunter",
    title: "XP Hunter",
    description: "Earn 100 XP",
    icon: "⭐",
    unlocked: false,
  },
  {
    id: "goal-master",
    title: "Goal Master",
    description: "Complete all 3 daily goals",
    icon: "🏆",
    unlocked: false,
  },
  {
    id: "ai-explorer",
    title: "AI Explorer",
    description: "Use Prompt Lab and Chat Analyzer",
    icon: "🚀",
    unlocked: false,
  },
];

// =====================================
// GET SAVED ACHIEVEMENTS
// =====================================

const getAchievements = (): Achievement[] => {
  const saved = localStorage.getItem("achievements");

  if (!saved) {
    return defaultAchievements.map(
      (achievement) => ({
        ...achievement,
      })
    );
  }

  try {
    const parsed = JSON.parse(saved);

    if (!Array.isArray(parsed)) {
      return defaultAchievements.map(
        (achievement) => ({
          ...achievement,
        })
      );
    }

    return defaultAchievements.map(
      (defaultAchievement) => {
        const savedAchievement =
          parsed.find(
            (item: Achievement) =>
              item.id ===
              defaultAchievement.id
          );

        return {
          ...defaultAchievement,
          unlocked: Boolean(
            savedAchievement?.unlocked
          ),
        };
      }
    );
  } catch {
    return defaultAchievements.map(
      (achievement) => ({
        ...achievement,
      })
    );
  }
};

// =====================================
// SAVE ACHIEVEMENTS
// =====================================

const saveAchievements = (
  achievements: Achievement[]
) => {
  localStorage.setItem(
    "achievements",
    JSON.stringify(achievements)
  );
};

// =====================================
// GET TOTAL PROMPTS
// =====================================

const getTotalPrompts = (): number => {
  const saved =
    localStorage.getItem("promptHistory");

  if (!saved) {
    return 0;
  }

  try {
    const parsed = JSON.parse(saved);

    return Array.isArray(parsed)
      ? parsed.length
      : 0;
  } catch {
    return 0;
  }
};

// =====================================
// GET TOTAL LESSONS
// =====================================

const getTotalLessons = (): number => {
  const saved =
    localStorage.getItem("totalLessonsCompleted");

  if (!saved) {
    return 0;
  }

  return Number(saved) || 0;
};

// =====================================
// GET TOTAL XP
// =====================================

const getTotalXP = (): number => {
  return (
    Number(
      localStorage.getItem("xp")
    ) || 0
  );
};

// =====================================
// GET STREAK
// =====================================

const getStreak = (): number => {
  return (
    Number(
      localStorage.getItem("streak")
    ) || 0
  );
};

// =====================================
// DAILY GOALS
// =====================================

const areDailyGoalsCompleted =
  (): boolean => {
    const saved =
      localStorage.getItem(
        "dailyGoals"
      );

    if (!saved) {
      return false;
    }

    try {
      const goals =
        JSON.parse(saved);

      return (
        Boolean(goals.lesson) &&
        Boolean(goals.prompts) &&
        Boolean(goals.xp)
      );
    } catch {
      return false;
    }
  };

// =====================================
// CHAT ANALYZER
// =====================================

const hasUsedChatAnalyzer =
  (): boolean => {
    const saved =
      localStorage.getItem(
        "chatAnalysisHistory"
      );

    if (!saved) {
      return false;
    }

    try {
      const parsed =
        JSON.parse(saved);

      return (
        Array.isArray(parsed) &&
        parsed.length > 0
      );
    } catch {
      return false;
    }
  };

// =====================================
// CHECK ALL ACHIEVEMENTS
// =====================================

export const checkAchievements =
  (): {
    achievements: Achievement[];
    newlyUnlocked: Achievement[];
  } => {
    const achievements =
      getAchievements();

    const totalPrompts =
      getTotalPrompts();

    const totalLessons =
      getTotalLessons();

    const xp =
      getTotalXP();

    const streak =
      getStreak();

    const goalsCompleted =
      areDailyGoalsCompleted();

    const usedChatAnalyzer =
      hasUsedChatAnalyzer();

    const newlyUnlocked: Achievement[] =
      [];

    const updatedAchievements =
      achievements.map(
        (achievement) => {
          // Already unlocked
          if (achievement.unlocked) {
            return achievement;
          }

          let unlocked = false;

          switch (achievement.id) {

            // =========================
            // FIRST STEP
            // =========================

            case "first-lesson":
              unlocked =
                totalLessons >= 1;
              break;

            // =========================
            // PROMPT BEGINNER
            // =========================

            case "prompt-beginner":
              unlocked =
                totalPrompts >= 5;
              break;

            // =========================
            // 3-DAY STREAK
            // =========================

            case "three-day-streak":
              unlocked =
                streak >= 3;
              break;

            // =========================
            // XP HUNTER
            // =========================

            case "xp-hunter":
              unlocked =
                xp >= 100;
              break;

            // =========================
            // GOAL MASTER
            // =========================

            case "goal-master":
              unlocked =
                goalsCompleted;
              break;

            // =========================
            // AI EXPLORER
            // =========================

            case "ai-explorer":
              unlocked =
                totalPrompts >= 1 &&
                usedChatAnalyzer;
              break;

            default:
              unlocked = false;
          }

          if (unlocked) {
            const unlockedAchievement: Achievement =
              {
                ...achievement,
                unlocked: true,
              };

            newlyUnlocked.push(
              unlockedAchievement
            );

            return unlockedAchievement;
          }

          return achievement;
        }
      );

    saveAchievements(
      updatedAchievements
    );

    return {
      achievements:
        updatedAchievements,
      newlyUnlocked,
    };
  };
const totalLessons =
  Number(
    localStorage.getItem(
      "totalLessonsCompleted"
    )
  ) || 0;

localStorage.setItem(
  "totalLessonsCompleted",
  String(totalLessons + 1)
);
// =====================================
// GET SAVED ACHIEVEMENTS
// =====================================

export const getSavedAchievements =
  (): Achievement[] => {
    return getAchievements();
  };