interface Course {
  title: string;
  progress: number;
}

interface ContinueLearningProps {
  course: Course | null;
}

function ContinueLearning({
  course,
}: ContinueLearningProps) {
  if (!course) return null;

  return (
    <div className="continue-learning">
      <h2>🔥 Continue Learning</h2>

      <h3>{course.title}</h3>

      <p>{course.progress}% Completed</p>

      <button>Continue</button>
    </div>
  );
}

export default ContinueLearning;