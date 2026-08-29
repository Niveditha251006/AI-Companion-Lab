export type XPLevel = {
  level: number;
  minXP: number;
  maxXP: number | null;
};

const levels: XPLevel[] = [
  {
    level: 1,
    minXP: 0,
    maxXP: 100,
  },
  {
    level: 2,
    minXP: 100,
    maxXP: 250,
  },
  {
    level: 3,
    minXP: 250,
    maxXP: 500,
  },
  {
    level: 4,
    minXP: 500,
    maxXP: 1000,
  },
  {
    level: 5,
    minXP: 1000,
    maxXP: null,
  },
];

export const getXP = (): number => {
  return (
    Number(
      localStorage.getItem("xp")
    ) || 0
  );
};

export const getCurrentLevel = (
  xp: number
): XPLevel => {
  for (let i = levels.length - 1; i >= 0; i--) {
    if (xp >= levels[i].minXP) {
      return levels[i];
    }
  }

  return levels[0];
};

export const getNextLevel = (
  xp: number
): XPLevel | null => {
  const current =
    getCurrentLevel(xp);

  const next =
    levels.find(
      (level) =>
        level.level ===
        current.level + 1
    );

  return next || null;
};

export const getLevelProgress = (
  xp: number
): number => {
  const current =
    getCurrentLevel(xp);

  const next =
    getNextLevel(xp);

  if (!next) {
    return 100;
  }

  const levelXP =
    xp - current.minXP;

  const requiredXP =
    next.minXP - current.minXP;

  if (requiredXP <= 0) {
    return 100;
  }

  return Math.min(
    100,
    Math.max(
      0,
      (levelXP / requiredXP) * 100
    )
  );
};

export const getXPToNextLevel = (
  xp: number
): number => {
  const next =
    getNextLevel(xp);

  if (!next) {
    return 0;
  }

  return Math.max(
    0,
    next.minXP - xp
  );
};