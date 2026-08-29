import { useNavigate } from "react-router-dom";
import "../styles/QuickActions.css";

function QuickActions() {
  const navigate = useNavigate();

  return (
    <div className="quick-actions">

      <h2>⚡ Quick Actions</h2>

      <div className="actions-grid">

        <button onClick={() => navigate("/learning")}>
          📚 Learning Hub
        </button>

        <button onClick={() => navigate("/chat-analyzer")}>
          🤖 Chat Analyzer
        </button>

        <button onClick={() => navigate("/profile")}>
          👤 Profile
        </button>

        <button onClick={() => navigate("/prompt-lab")}>
          🧠 Prompt Lab
        </button>

      </div>

    </div>
  );
}

export default QuickActions;