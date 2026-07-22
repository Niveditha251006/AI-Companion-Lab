import { Link } from "react-router-dom";
import "../styles/navbar.css";

function Navbar() {
  return (
    <nav className="navbar">
      <div className="logo">🚀 AI Companion Lab</div>

      <ul className="nav-links">
        <li><Link to="/">Home</Link></li>
        <li><Link to="/prompt-lab">Prompt Lab</Link></li>
        <li><Link to="/chat-analyzer">Chat Analyzer</Link></li>
        <li><Link to="/learning">Learning</Link></li>
      </ul>

      <button className="login-btn">Login</button>
    </nav>
  );
}

export default Navbar;