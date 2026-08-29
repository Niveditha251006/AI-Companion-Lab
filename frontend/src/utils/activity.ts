// =====================================
// TYPES
// =====================================

export type DailyActivity = {
  date: string;
  lessonsCompleted: number;
  promptsImproved: number;
  xpEarned: number;
};

export type DailyGoals = {
  lesson: boolean;
  prompts: boolean;
  xp: boolean;
};

// =====================================
// DEFAULT VALUES
// =====================================

const defaultActivity: DailyActivity = {
  date: "",
  lessonsCompleted: 0,
  promptsImproved: 0,
  xpEarned: 0,
};

const defaultGoals: DailyGoals = {
  lesson: false,
  prompts: false,
  xp: false,
};

// =====================================
// GET TODAY'S ACTIVITY
// =====================================

const getTodayActivity = (): DailyActivity => {
  const today = new Date().toDateString();

  const savedActivity =
    localStorage.getItem("dailyActivity");

  // No saved activity
  if (!savedActivity) {
    return {
      ...defaultActivity,
      date: today,
    };
  }

  try {
    const parsed = JSON.parse(savedActivity);

    // Saved activity belongs to another day
    if (parsed.date !== today) {
      return {
        ...defaultActivity,
        date: today,
      };
    }

    return {
      date: today,
      lessonsCompleted:
        Number(parsed.lessonsCompleted) || 0,
      promptsImproved:
        Number(parsed.promptsImproved) || 0,
      xpEarned:
        Number(parsed.xpEarned) || 0,
    };
  } catch {
    return {
      ...defaultActivity,
      date: today,
    };
  }
};

// =====================================
// SAVE DAILY ACTIVITY
// =====================================

const saveActivity = (
  activity: DailyActivity
) => {
  localStorage.setItem(
    "dailyActivity",
    JSON.stringify(activity)
  );
};

// =====================================
// UPDATE DAILY GOALS
// =====================================

const updateDailyGoals = (
  activity: DailyActivity
) => {
  const today =
    new Date().toDateString();

  const savedDate =
    localStorage.getItem(
      "dailyGoalsDate"
    );

  let goals: DailyGoals = {
    ...defaultGoals,
  };

  // Load today's existing goals
  if (savedDate === today) {
    const savedGoals =
      localStorage.getItem(
        "dailyGoals"
      );

    if (savedGoals) {
      try {
        const parsed =
          JSON.parse(savedGoals);

        goals = {
          lesson: Boolean(
            parsed.lesson
          ),
          prompts: Boolean(
            parsed.prompts
          ),
          xp: Boolean(
            parsed.xp
          ),
        };
      } catch {
        goals = {
          ...defaultGoals,
        };
      }
    }
  }

  // -----------------------------
  // LESSON GOAL
  // -----------------------------

  if (
    activity.lessonsCompleted >= 1
  ) {
    goals.lesson = true;
  }

  // -----------------------------
  // PROMPT GOAL
  // -----------------------------

  if (
    activity.promptsImproved >= 3
  ) {
    goals.prompts = true;
  }

  // -----------------------------
  // XP GOAL
  // -----------------------------

  if (
    activity.xpEarned >= 20
  ) {
    goals.xp = true;
  }

  // Save goals
  localStorage.setItem(
    "dailyGoals",
    JSON.stringify(goals)
  );

  localStorage.setItem(
    "dailyGoalsDate",
    today
  );

  // Notify React components
  window.dispatchEvent(
    new Event("activityUpdated")
  );
};

// =====================================
// UPDATE LEARNING STREAK
// =====================================

export const recordLearningActivity =
  () => {
    const today =
      new Date().toDateString();

    const lastActiveDate =
      localStorage.getItem(
        "lastActiveDate"
      );

    let streak =
      Number(
        localStorage.getItem(
          "streak"
        )
      ) || 0;

    // -----------------------------
    // ALREADY ACTIVE TODAY
    // -----------------------------

    if (
      lastActiveDate === today
    ) {
      return;
    }

    // -----------------------------
    // YESTERDAY
    // -----------------------------

    const yesterday =
      new Date();

    yesterday.setDate(
      yesterday.getDate() - 1
    );

    // -----------------------------
    // CALCULATE STREAK
    // -----------------------------

    if (
      lastActiveDate ===
      yesterday.toDateString()
    ) {
      streak += 1;
    } else {
      streak = 1;
    }

    // -----------------------------
    // SAVE STREAK
    // -----------------------------

    localStorage.setItem(
      "streak",
      String(streak)
    );

    localStorage.setItem(
      "lastActiveDate",
      today
    );

    // Notify components
    window.dispatchEvent(
      new Event("activityUpdated")
    );
  };

// =====================================
// ADD XP
// =====================================

export const addXP = (
  amount: number
) => {
  const currentXP =
    Number(
      localStorage.getItem("xp")
    ) || 0;

  const newXP =
    currentXP + amount;

  localStorage.setItem(
    "xp",
    String(newXP)
  );

  // Notify components
  window.dispatchEvent(
    new Event("activityUpdated")
  );

  return newXP;
};

// =====================================
// RECORD LESSON ACTIVITY
// =====================================

export const recordLessonActivity =
  () => {
    const activity =
      getTodayActivity();

    // Add lesson
    activity.lessonsCompleted += 1;

    // Add 10 XP
    activity.xpEarned += 10;

    // Save activity
    saveActivity(activity);

    // Add total XP
    addXP(10);

    // Update goals
    updateDailyGoals(
      activity
    );

    // Update streak
    recordLearningActivity();

    // Notify components
    window.dispatchEvent(
      new Event("activityUpdated")
    );

    return activity;
  };

// =====================================
// RECORD PROMPT ACTIVITY
// =====================================

export const recordPromptActivity =
  () => {
    const activity =
      getTodayActivity();

    // Add improved prompt
    activity.promptsImproved += 1;

    // Add 10 XP
    activity.xpEarned += 10;

    // Save activity
    saveActivity(activity);

    // Add total XP
    addXP(10);

    // Update goals
    updateDailyGoals(
      activity
    );

    // Update streak
    recordLearningActivity();

    // Notify components
    window.dispatchEvent(
      new Event("activityUpdated")
    );

    return activity;
  };