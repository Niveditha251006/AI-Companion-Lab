import { useEffect, useState } from "react";
import "../styles/LearningPage.css";

import CourseCard from "../components/CourseCard";
import SearchBar from "../components/SearchBar";
import StatsCard from "../components/StatsCard";
import ContinueLearning from "../components/ContinueLearning";
import FavoriteSection from "../components/FavoriteSection";
import CourseModal from "../components/CourseModal";
import AchievementCard from "../components/AchievementCard";
import Toast from "../components/Toast";

import { recordLessonActivity } from "../utils/activity";

type Course = {
  id: number;
  title: string;
  category: string;
  level: string;
  duration: string;
  progress: number;
  lessons: number;
  instructor: string;
  favorite: boolean;
};

type ApiCourse = {
  course_id: number;
  progress: number;
  favorite: number | boolean;
  updated_at?: string;
};

const API_BASE_URL = "http://127.0.0.1:5000/api";

const defaultCourses: Course[] = [
  {
    id: 1,
    title: "React Basics",
    category: "Frontend",
    level: "Beginner",
    duration: "3 Hours",
    progress: 0,
    lessons: 12,
    instructor: "Meta",
    favorite: false,
  },
  {
    id: 2,
    title: "TypeScript",
    category: "Programming",
    level: "Intermediate",
    duration: "4 Hours",
    progress: 0,
    lessons: 10,
    instructor: "Microsoft",
    favorite: false,
  },
  {
    id: 3,
    title: "Prompt Engineering",
    category: "AI",
    level: "Beginner",
    duration: "2 Hours",
    progress: 0,
    lessons: 8,
    instructor: "OpenAI",
    favorite: false,
  },
  {
    id: 4,
    title: "Machine Learning",
    category: "AI",
    level: "Advanced",
    duration: "8 Hours",
    progress: 0,
    lessons: 20,
    instructor: "Andrew Ng",
    favorite: false,
  },
];

function LearningPage() {
  const [search, setSearch] = useState("");

  const [toast, setToast] = useState("");

  const [lastOpenedCourse, setLastOpenedCourse] =
    useState<Course | null>(null);

  const [showModal, setShowModal] = useState(false);

  const [courses, setCourses] =
    useState<Course[]>(defaultCourses);

  const [loadingCourses, setLoadingCourses] =
    useState(true);

  // =====================================
  // GET LOGGED-IN USER ID
  // =====================================

  const userId =
    localStorage.getItem("userId") || "";

  // =====================================
  // SHOW TOAST
  // =====================================

  const showToast = (message: string) => {
    setToast(message);

    setTimeout(() => {
      setToast("");
    }, 2500);
  };

  // =====================================
  // LOAD LEARNING DATA FROM MYSQL
  // =====================================

  const loadLearningData = async () => {
    if (!userId) {
      console.error(
        "❌ User ID not found."
      );

      setLoadingCourses(false);

      return;
    }

    try {
      setLoadingCourses(true);

      const response = await fetch(
        `${API_BASE_URL}/learning/${userId}`
      );

      if (!response.ok) {
        throw new Error(
          `Failed to load learning data (${response.status})`
        );
      }

      const data = await response.json();

      const apiCourses: ApiCourse[] =
        Array.isArray(data.courses)
          ? data.courses
          : [];

      // =================================
      // MERGE MYSQL DATA WITH DEFAULT COURSES
      // =================================

      const mergedCourses =
        defaultCourses.map((course) => {
          const savedCourse =
            apiCourses.find(
              (item) =>
                Number(item.course_id) ===
                course.id
            );

          if (!savedCourse) {
            return course;
          }

          return {
            ...course,
            progress: Number(
              savedCourse.progress || 0
            ),
            favorite:
              Boolean(savedCourse.favorite),
          };
        });

     setCourses(mergedCourses);

// =================================
// SET CONTINUE LEARNING COURSE
// =================================

if (apiCourses.length > 0) {
  const latestSavedCourse = [...apiCourses]
    .filter((course) => course.updated_at)
    .sort(
      (a, b) =>
        new Date(
          b.updated_at || ""
        ).getTime() -
        new Date(
          a.updated_at || ""
        ).getTime()
    )[0];

  if (latestSavedCourse) {
    const latestCourse = mergedCourses.find(
      (course) =>
        course.id ===
        Number(
          latestSavedCourse.course_id
        )
    );

    if (latestCourse) {
      setLastOpenedCourse(
        latestCourse
      );
    }
  }
}

console.log(
  "✅ Learning data loaded:",
  mergedCourses
);
    } catch (error) {
      console.error(
        "❌ Failed to load learning data:",
        error
      );

      setCourses(defaultCourses);

      showToast(
        "⚠️ Could not load learning data."
      );
    } finally {
      setLoadingCourses(false);
    }
  };

  // =====================================
  // LOAD WHEN PAGE OPENS
  // =====================================

  useEffect(() => {
    loadLearningData();
  }, [userId]);

  // =====================================
  // SEARCH
  // =====================================

  const filteredCourses =
    courses.filter(
      (course) =>
        course.title
          .toLowerCase()
          .includes(
            search.toLowerCase()
          ) ||
        course.category
          .toLowerCase()
          .includes(
            search.toLowerCase()
          )
    );

  // =====================================
  // COMPLETE LESSON
  // =====================================

  const increaseProgress = async (
    id: number
  ) => {
    const course = courses.find(
      (item) => item.id === id
    );

    if (!course) {
      return;
    }

    if (!userId) {
      showToast(
        "❌ Please login first."
      );

      return;
    }

    // Already completed
    if (course.progress >= 100) {
      showToast(
        "🏆 Course already completed!"
      );

      return;
    }

    // Increase by 10%
    const newProgress = Math.min(
      course.progress + 10,
      100
    );

    try {
      const response = await fetch(
        `${API_BASE_URL}/learning/progress`,
        {
          method: "POST",

          headers: {
            "Content-Type":
              "application/json",
          },

          body: JSON.stringify({
            user_id: Number(userId),
            course_id: id,
            progress: newProgress,
          }),
        }
      );

      const data = await response.json();

      if (!response.ok) {
        throw new Error(
          data.message ||
            "Failed to save progress"
        );
      }

      // =================================
      // UPDATE UI
      // =================================

      setCourses(
        (previousCourses) =>
          previousCourses.map(
            (item) =>
              item.id === id
                ? {
                    ...item,
                    progress:
                      newProgress,
                  }
                : item
          )
      );

      // Update opened course
      setLastOpenedCourse(
        (previous) => {
          if (
            !previous ||
            previous.id !== id
          ) {
            return previous;
          }

          return {
            ...previous,
            progress:
              newProgress,
          };
        }
      );

      // Record activity
      recordLessonActivity();

      console.log(
        "✅ Progress saved:",
        data
      );

      if (newProgress >= 100) {
        showToast(
          "🏆 Course completed! +10 XP"
        );
      } else {
        showToast(
          "🎉 Lesson completed! +10 XP"
        );
      }
    } catch (error) {
      console.error(
        "❌ Failed to save progress:",
        error
      );

      showToast(
        "❌ Could not save progress."
      );
    }
  };

  // =====================================
  // FAVORITE
  // =====================================

  const toggleFavorite = async (
    id: number
  ) => {
    const course = courses.find(
      (item) => item.id === id
    );

    if (!course) {
      return;
    }

    if (!userId) {
      showToast(
        "❌ Please login first."
      );

      return;
    }

    const newFavorite =
      !course.favorite;

    try {
      const response = await fetch(
        `${API_BASE_URL}/learning/favorite`,
        {
          method: "POST",

          headers: {
            "Content-Type":
              "application/json",
          },

          body: JSON.stringify({
            user_id: Number(userId),
            course_id: id,
            favorite:
              newFavorite,
          }),
        }
      );

      const data = await response.json();

      if (!response.ok) {
        throw new Error(
          data.message ||
            "Failed to update favorite"
        );
      }

      // =================================
      // UPDATE UI
      // =================================

      setCourses(
        (previousCourses) =>
          previousCourses.map(
            (item) =>
              item.id === id
                ? {
                    ...item,
                    favorite:
                      newFavorite,
                  }
                : item
          )
      );

      // Update opened course
      setLastOpenedCourse(
        (previous) => {
          if (
            !previous ||
            previous.id !== id
          ) {
            return previous;
          }

          return {
            ...previous,
            favorite:
              newFavorite,
          };
        }
      );

      console.log(
        "✅ Favorite saved:",
        data
      );

      showToast(
        newFavorite
          ? "⭐ Added to favorites!"
          : "☆ Removed from favorites!"
      );
    } catch (error) {
      console.error(
        "❌ Failed to update favorite:",
        error
      );

      showToast(
        "❌ Could not update favorite."
      );
    }
  };

  // =====================================
  // STATISTICS
  // =====================================

  const totalCourses =
    courses.length;

  const completedCourses =
    courses.filter(
      (course) =>
        course.progress >= 100
    ).length;

  const inProgressCourses =
    courses.filter(
      (course) =>
        course.progress > 0 &&
        course.progress < 100
    ).length;

  const notStartedCourses =
    courses.filter(
      (course) =>
        course.progress === 0
    ).length;

  const overallProgress =
    totalCourses > 0
      ? courses.reduce(
          (sum, course) =>
            sum + course.progress,
          0
        ) / totalCourses
      : 0;

  // =====================================
  // FAVORITES
  // =====================================

  const favoriteCourses =
    courses.filter(
      (course) =>
        course.favorite
    );

  // =====================================
  // UI
  // =====================================

  return (
    <div className="learning-page">

      {/* PAGE TITLE */}

      <h1>
        📚 Learning Hub
      </h1>

      {/* TOAST */}

      {toast && (
        <Toast message={toast} />
      )}

      {/* SEARCH */}

      <SearchBar
        search={search}
        setSearch={setSearch}
      />

      {/* CONTINUE LEARNING */}

      <ContinueLearning
        course={lastOpenedCourse}
      />

      {/* STATISTICS */}

      <div className="stats-container">

        <StatsCard
          icon="📚"
          title="Total"
          value={totalCourses}
        />

        <StatsCard
          icon="🏆"
          title="Completed"
          value={completedCourses}
        />

        <StatsCard
          icon="📖"
          title="In Progress"
          value={inProgressCourses}
        />

        <StatsCard
          icon="😴"
          title="Not Started"
          value={notStartedCourses}
        />

      </div>

      {/* OVERALL PROGRESS */}

      <div className="overall-progress">

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

      </div>

      {/* ACHIEVEMENT */}

      <AchievementCard />

      {/* FAVORITES */}

      <FavoriteSection
        courses={favoriteCourses}
      />

      {/* COURSE LIST */}

      <div className="course-list">

        {loadingCourses ? (
          <p>
            ⏳ Loading your learning data...
          </p>
        ) : filteredCourses.length ===
          0 ? (
          <p>
            ❌ No courses found.
          </p>
        ) : (
          filteredCourses.map(
            (course) => (
              <CourseCard
                key={course.id}
                course={course}

                onStart={() => {
                  setLastOpenedCourse(
                    course
                  );

                  setShowModal(true);
                }}

                onComplete={() => {
                  increaseProgress(
                    course.id
                  );
                }}

                onFavorite={() => {
                  toggleFavorite(
                    course.id
                  );
                }}
              />
            )
          )
        )}

      </div>

      {/* COURSE MODAL */}

      {showModal &&
        lastOpenedCourse && (
          <CourseModal
            course={
              lastOpenedCourse
            }

            onClose={() => {
              setShowModal(false);
            }}
          />
        )}

    </div>
  );
}

export default LearningPage;