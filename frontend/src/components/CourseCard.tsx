interface Course {
  id: number;
  title: string;
  category: string;
  level: string;
  duration: string;
  progress: number;
  lessons: number;
  instructor: string;
  favorite: boolean;
}

interface CourseCardProps {
  course: Course;
  onStart: () => void;
  onComplete: () => void;
  onFavorite: () => void;
}

function CourseCard({
  course,
  onStart,
  onComplete,
  onFavorite,
}: CourseCardProps) {
  return (
    <div className="course-card">
      <div className="course-header">
        <h2>{course.title}</h2>

        <button className="favorite-btn" onClick={onFavorite}>
          {course.favorite ? "❤️" : "🤍"}
        </button>
      </div>

      <p>📂 Category: {course.category}</p>

      <p>
        {course.level === "Beginner"
          ? "🟢 Beginner"
          : course.level === "Intermediate"
          ? "🟡 Intermediate"
          : "🔴 Advanced"}
      </p>

      <p>👨‍🏫 Instructor: {course.instructor}</p>

      <p>📚 Lessons: {course.lessons}</p>

      <p>⏰ Duration: {course.duration}</p>

      <p>📈 Progress: {course.progress}%</p>

      <div className="progress-bar">
        <div
          className="progress-fill"
          style={{ width: `${course.progress}%` }}
        />
      </div>

      <div className="button-group">
        <button onClick={onStart}>▶️ Start Learning</button>

        <button onClick={onComplete}>
          ➕ Complete Lesson
        </button>
      </div>
    </div>
  );
}

export default CourseCard;