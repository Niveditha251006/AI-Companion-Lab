import { Link } from "react-router-dom";

function LandingPage() {
  return (
    <div>
      <h1>🚀 AI Companion Lab</h1>
      <p>Helping people learn with AI, not just talk to AI.</p>

      <hr />

      <h2>Explore</h2>

      <ul>
        <li><Link to="/login">Login</Link></li>
        <li><Link to="/dashboard">Dashboard</Link></li>
        <li><Link to="/prompt-lab">Prompt Lab</Link></li>
        <li><Link to="/chat-analyzer">Chat Analyzer</Link></li>
        <li><Link to="/learning">Learning</Link></li>
        <li><Link to="/profile">Profile</Link></li>
      </ul>
    </div>
  );
}

export default LandingPage;