import { useNavigate } from "react-router-dom";
import "../styles/Navbar.css";

function Navbar() {
  const navigate = useNavigate();

  const userName = localStorage.getItem("userName") || "User";

  const handleLogout = () => {
    localStorage.removeItem("isLoggedIn");
    localStorage.removeItem("userEmail");
    localStorage.removeItem("userName");
    localStorage.removeItem("userId");

    alert("👋 Logged out successfully!");

    navigate("/login");
  };

  return (
    <nav className="navbar">

      {/* Logo */}
      <div
        className="navbar-logo"
        onClick={() => navigate("/dashboard")}
      >
        🤖 AI Companion Lab
      </div>

      {/* Navigation Links */}
      <div className="navbar-links">

        <button onClick={() => navigate("/dashboard")}>
          🏠 Dashboard
        </button>

        <button onClick={() => navigate("/prompt-lab")}>
          🧠 Prompt Lab
        </button>

        <button onClick={() => navigate("/chat-analyzer")}>
          🔍 Chat Analyzer
        </button>

        <button onClick={() => navigate("/learning")}>
          📚 Learning
        </button>

        <button onClick={() => navigate("/profile")}>
          👤 {userName}
        </button>

        <button
          className="logout-button"
          onClick={handleLogout}
        >
          🚪 Logout
        </button>

      </div>

    </nav>
  );
}

export default Navbar;