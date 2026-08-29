interface Course {
  id: number;
  title: string;
  category: string;
  instructor: string;
  progress: number;
}

interface FavoriteSectionProps {
  courses: Course[];
}

function FavoriteSection({ courses }: FavoriteSectionProps) {
  if (courses.length === 0) return null;

  return (
    <div className="favorite-section">
      <h2>❤️ Favorite Courses</h2>

      {courses.map((course) => (
        <div key={course.id} className="favorite-card">
          <h3>{course.title}</h3>

          <p>📂 {course.category}</p>

          <p>👨‍🏫 {course.instructor}</p>

          <p>📈 {course.progress}% Completed</p>
        </div>
      ))}
    </div>
  );
}

export default FavoriteSection;