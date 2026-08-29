import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import "../styles/ProfilePage.css";

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

function ProfilePage() {
  const navigate = useNavigate();

  // =========================
  // USER DATA
  // =========================

  const [userName, setUserName] = useState(
    localStorage.getItem("userName") || "User"
  );

  const [userEmail, setUserEmail] = useState(
    localStorage.getItem("userEmail") || "No email"
  );

  const userId = localStorage.getItem("userId") || "";
useEffect(() => {
  const fetchProfile = async () => {
    if (!userId) {
      return;
    }

    try {
      const response = await fetch(
        `http://127.0.0.1:5000/api/profile/${userId}`
      );

      const data = await response.json();

      if (!response.ok) {
        console.error(
          "Failed to fetch profile:",
          data.message
        );
        return;
      }

      const user = data.user;

      setUserName(user.name);
      setUserEmail(user.email);

      setEditName(user.name);
      setEditEmail(user.email);

      // Keep localStorage synchronized
      localStorage.setItem(
        "userName",
        user.name
      );

      localStorage.setItem(
        "userEmail",
        user.email
      );

    } catch (error) {
      console.error(
        "Profile fetch error:",
        error
      );
    }
  };

  fetchProfile();
}, [userId]);
  // =========================
  // EDIT MODE
  // =========================

  const [isEditing, setIsEditing] = useState(false);

  const [editName, setEditName] = useState(userName);
  const [editEmail, setEditEmail] = useState(userEmail);

  const [loading, setLoading] = useState(false);

  // =========================
  // COURSES
  // =========================

  const [courses, setCourses] = useState<Course[]>([]);

  useEffect(() => {
    const savedCourses = localStorage.getItem("courses");

    if (savedCourses) {
      try {
        setCourses(JSON.parse(savedCourses));
      } catch (error) {
        console.error("Failed to load courses:", error);
      }
    }
  }, []);

  // =========================
  // STATISTICS
  // =========================

  const totalCourses = courses.length;

  const completedCourses = courses.filter(
    (course) => course.progress === 100
  ).length;

  const xp = Number(localStorage.getItem("xp")) || 0;

  // =========================
  // EDIT PROFILE
  // =========================

  const handleEdit = () => {
    setEditName(userName);
    setEditEmail(userEmail);

    setIsEditing(true);
  };

  // =========================
  // CANCEL EDIT
  // =========================

  const handleCancel = () => {
    setEditName(userName);
    setEditEmail(userEmail);

    setIsEditing(false);
  };

  // =========================
  // SAVE PROFILE
  // =========================

  const handleSave = async () => {
    if (!editName.trim() || !editEmail.trim()) {
      alert("⚠️ Name and email are required.");
      return;
    }

    if (!userId) {
      alert("❌ User ID not found. Please login again.");
      return;
    }

    try {
      setLoading(true);

      const response = await fetch(
        `http://127.0.0.1:5000/api/profile/${userId}`,
        {
          method: "PUT",

          headers: {
            "Content-Type": "application/json",
          },

          body: JSON.stringify({
            name: editName.trim(),
            email: editEmail.trim(),
          }),
        }
      );

      const data = await response.json();

      if (!response.ok) {
        alert(`❌ ${data.message || "Failed to update profile."}`);
        return;
      }

      // =========================
      // UPDATE LOCAL STORAGE
      // =========================

      localStorage.setItem(
        "userName",
        data.user.name
      );

      localStorage.setItem(
        "userEmail",
        data.user.email
      );

      // =========================
      // UPDATE PAGE
      // =========================

      setUserName(data.user.name);
      setUserEmail(data.user.email);

      setEditName(data.user.name);
      setEditEmail(data.user.email);

      setIsEditing(false);

      alert("✅ Profile updated successfully!");

      // Refresh page so Navbar gets new username
      window.location.reload();

    } catch (error) {
      console.error("Profile update error:", error);

      alert(
        "❌ Unable to connect to the backend. Make sure Flask is running."
      );
    } finally {
      setLoading(false);
    }
  };

  // =========================
  // LOGOUT
  // =========================

  const handleLogout = () => {
    localStorage.removeItem("isLoggedIn");
    localStorage.removeItem("userEmail");
    localStorage.removeItem("userName");
    localStorage.removeItem("userId");

    alert("👋 Logged out successfully!");

    navigate("/login");
  };

  // =========================
  // UI
  // =========================

  return (
    <div className="profile-page">

      {/* =========================
          PROFILE HEADER
      ========================= */}

      <div className="profile-header">

        <div className="profile-avatar">
          👤
        </div>

        <h1>{userName}</h1>

        <p>{userEmail}</p>

      </div>


      {/* =========================
          PROFILE INFORMATION
      ========================= */}

      <div className="profile-card">

        <div className="profile-card-header">

          <h2>👤 Profile Information</h2>

          {!isEditing && (
            <button
              className="edit-button"
              onClick={handleEdit}
            >
              ✏️ Edit Profile
            </button>
          )}

        </div>


        {/* NAME */}

        <label>Name</label>

        <input
          type="text"
          value={isEditing ? editName : userName}
          disabled={!isEditing}
          onChange={(e) =>
            setEditName(e.target.value)
          }
        />


        {/* EMAIL */}

        <label>Email</label>

        <input
          type="email"
          value={isEditing ? editEmail : userEmail}
          disabled={!isEditing}
          onChange={(e) =>
            setEditEmail(e.target.value)
          }
        />


        {/* USER ID */}

        <label>User ID</label>

        <input
          type="text"
          value={userId}
          disabled
        />


        {/* EDIT BUTTONS */}

        {isEditing && (
          <div className="profile-edit-buttons">

            <button
              className="save-button"
              onClick={handleSave}
              disabled={loading}
            >
              {loading
                ? "⏳ Saving..."
                : "💾 Save Changes"}
            </button>

            <button
              className="cancel-button"
              onClick={handleCancel}
              disabled={loading}
            >
              ❌ Cancel
            </button>

          </div>
        )}


        {/* LOGOUT */}

        {!isEditing && (
          <button
            className="logout-profile-button"
            onClick={handleLogout}
          >
            🚪 Logout
          </button>
        )}

      </div>


      {/* =========================
          PROFILE STATISTICS
      ========================= */}

      <div className="profile-stats">

        <div className="profile-stat-card">

          <span>📚</span>

          <h3>Courses</h3>

          <p>{totalCourses}</p>

        </div>


        <div className="profile-stat-card">

          <span>⭐</span>

          <h3>XP</h3>

          <p>{xp}</p>

        </div>


        <div className="profile-stat-card">

          <span>🏆</span>

          <h3>Completed</h3>

          <p>{completedCourses}</p>

        </div>

      </div>

    </div>
  );
}

export default ProfilePage;