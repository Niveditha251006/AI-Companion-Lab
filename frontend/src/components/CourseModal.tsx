import { useState } from "react";
import { courseLessons } from "../data/courseLessons";
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

type Props = {
  course: Course;
  onClose: () => void;
};

function CourseModal({
  course,
  onClose,
}: Props) {
  const lessons =
    courseLessons[course.id] || [];

  /*
   * Convert course progress into
   * the number of completed lessons.
   *
   * Example:
   * 80% of 12 lessons = approximately 10 lessons
   */
  const initialCompletedLessons = Math.min(
    Math.round(
      (course.progress / 100) *
        lessons.length
    ),
    lessons.length
  );

  const [completedLessons, setCompletedLessons] =
    useState(initialCompletedLessons);

  const completeLesson = (
    lessonIndex: number
  ) => {
    /*
     * Prevent completing the same lesson
     * multiple times.
     */
    if (lessonIndex < completedLessons) {
      return;
    }

    /*
     * Lessons must be completed in order.
     */
    if (lessonIndex !== completedLessons) {
      alert(
        "📚 Please complete the previous lesson first."
      );

      return;
    }

    setCompletedLessons(
      completedLessons + 1
    );

    /*
     * Update the global activity system.
     *
     * This gives:
     * +10 XP
     * daily activity update
     * daily goal update
     * streak update
     * achievement update
     */
    recordLessonActivity();

    alert(
      "🎉 Lesson completed! +10 XP"
    );
  };

  const progress =
    lessons.length > 0
      ? Math.round(
          (completedLessons /
            lessons.length) *
            100
        )
      : course.progress;

  return (
    <div className="modal-overlay">
      <div className="course-modal">

        {/* COURSE HEADER */}

        <h1>
          📚 {course.title}
        </h1>

        <p>
          👨‍🏫 Instructor:{" "}
          {course.instructor}
        </p>

        <p>
          📂 Category:{" "}
          {course.category}
        </p>

        <p>
          📘 Level:{" "}
          {course.level}
        </p>

        <p>
          ⏰ Duration:{" "}
          {course.duration}
        </p>

        {/* PROGRESS */}

        <h3>
          📈 Progress: {progress}%
        </h3>

        <div className="progress-bar">
          <div
            className="progress-fill"
            style={{
              width: `${progress}%`,
            }}
          />
        </div>

        <p>
          ✅ {completedLessons} /{" "}
          {lessons.length} lessons completed
        </p>

        {/* LESSON LIST */}

        <div
          style={{
            textAlign: "left",
            marginTop: "20px",
            maxHeight: "300px",
            overflowY: "auto",
          }}
        >

          <h2>
            📖 Course Lessons
          </h2>

          {lessons.length === 0 ? (
            <p>
              No lessons available.
            </p>
          ) : (
            lessons.map(
              (lesson, index) => {

                const isCompleted =
                  index <
                  completedLessons;

                const isCurrent =
                  index ===
                  completedLessons;

                return (
                  <div
                    key={lesson.id}
                    style={{
                      padding: "12px",
                      marginBottom: "10px",
                      borderRadius: "10px",
                      background:
                        isCompleted
                          ? "#e8f5e9"
                          : isCurrent
                          ? "#fff8e1"
                          : "#f5f5f5",
                    }}
                  >

                    <div
                      style={{
                        display: "flex",
                        justifyContent:
                          "space-between",
                        alignItems:
                          "center",
                        gap: "10px",
                      }}
                    >

                      <span>
                        {isCompleted
                          ? "✅"
                          : isCurrent
                          ? "▶️"
                          : "🔒"}{" "}
                        {index + 1}.{" "}
                        {lesson.title}
                      </span>

                      {isCurrent && (
                        <button
                          onClick={() =>
                            completeLesson(
                              index
                            )
                          }
                        >
                          Complete
                        </button>
                      )}

                    </div>

                  </div>
                );
              }
            )
          )}

        </div>

        {/* COMPLETION MESSAGE */}

        {completedLessons ===
          lessons.length &&
          lessons.length > 0 && (
            <div
              style={{
                marginTop: "20px",
                padding: "15px",
                borderRadius: "10px",
                background:
                  "#e8f5e9",
              }}
            >
              <h2>
                🏆 Course Completed!
              </h2>

              <p>
                Congratulations! You
                completed all lessons.
              </p>
            </div>
          )}

        {/* BUTTONS */}

        <button
          onClick={onClose}
        >
          ❌ Close
        </button>

      </div>
    </div>
  );
}

export default CourseModal;