import { useEffect, useState } from "react";
import "../styles/LearningAnalytics.css";

type Course = {
  id: number;
  title: string;
  progress: number;
};

function LearningAnalytics() {
  const [courses, setCourses] = useState<Course[]>([]);

  useEffect(() => {
    const saved = localStorage.getItem("courses");

    if (saved) {
      setCourses(JSON.parse(saved));
    }
  }, []);

  const totalCourses = courses.length;

  const completedCourses = courses.filter(
    (course) => course.progress === 100
  ).length;

  const inProgressCourses = courses.filter(
    (course) => course.progress > 0 && course.progress < 100
  ).length;

  const overallProgress =
    totalCourses > 0
      ? courses.reduce((sum, course) => sum + course.progress, 0) /
        totalCourses
      : 0;

  return (
    <div className="learning-analytics">

      <h2>📈 Learning Analytics</h2>

      {/* Summary */}
      <div className="analytics-summary">

        <div className="analytics-summary-card">
          <span>📚</span>
          <h3>Total Courses</h3>
          <p>{totalCourses}</p>
        </div>

        <div className="analytics-summary-card">
          <span>🏆</span>
          <h3>Completed</h3>
          <p>{completedCourses}</p>
        </div>

        <div className="analytics-summary-card">
          <span>📖</span>
          <h3>In Progress</h3>
          <p>{inProgressCourses}</p>
        </div>

        <div className="analytics-summary-card">
          <span>📊</span>
          <h3>Overall Progress</h3>
          <p>{overallProgress.toFixed(1)}%</p>
        </div>

      </div>

      {/* Individual Course Progress */}
      <div className="analytics-courses">

        {courses.length === 0 ? (
          <p>No learning data available.</p>
        ) : (
          courses.map((course) => (
            <div
              key={course.id}
              className="analytics-item"
            >
              <span>{course.title}</span>

              <progress
                value={course.progress}
                max={100}
              />

              <span>{course.progress}%</span>
            </div>
          ))
        )}

      </div>

    </div>
  );
}

export default LearningAnalytics;