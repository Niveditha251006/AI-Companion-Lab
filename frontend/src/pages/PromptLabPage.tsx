import { useEffect, useState } from "react";
import "../styles/PromptLabPage.css";

import { recordPromptActivity } from "../utils/activity";

type Prompt = {
  id: number;
  text: string;
  favorite: boolean;
  created_at?: string;
};

type ApiPrompt = {
  id: number;
  user_id: number;
  prompt: string;
  favorite: boolean;
  created_at?: string;
};

const API_BASE_URL = "http://127.0.0.1:5000/api";

function PromptLabPage() {
  const [prompt, setPrompt] = useState("");
  const [improvedPrompt, setImprovedPrompt] = useState("");
  const [score, setScore] = useState(0);

  const [history, setHistory] = useState<Prompt[]>([]);
  const [search, setSearch] = useState("");

  const [loadingHistory, setLoadingHistory] = useState(true);
  const [savingPrompt, setSavingPrompt] = useState(false);

  // =====================================
  // GET LOGGED-IN USER ID
  // =====================================

  const userId = localStorage.getItem("userId") || "";

  // =====================================
  // LOAD PROMPT HISTORY
  // =====================================

  const loadPromptHistory = async () => {
    if (!userId) {
      console.error("❌ User ID not found.");

      setHistory([]);
      setLoadingHistory(false);

      return;
    }

    try {
      setLoadingHistory(true);

      const response = await fetch(
        `${API_BASE_URL}/prompt-history/${userId}`
      );

      if (!response.ok) {
        throw new Error(
          `Failed to load prompt history (${response.status})`
        );
      }

      const data = await response.json();

      const apiHistory: ApiPrompt[] = Array.isArray(
        data.history
      )
        ? data.history
        : [];

      const formattedHistory: Prompt[] =
        apiHistory
          .filter(
            (item) =>
              item &&
              typeof item.prompt === "string"
          )
          .map((item) => ({
            id: Number(item.id),
            text: item.prompt,
            favorite: Boolean(item.favorite),
            created_at: item.created_at,
          }));

      setHistory(formattedHistory);

      console.log(
        "✅ Prompt history loaded:",
        formattedHistory
      );
    } catch (error) {
      console.error(
        "❌ Failed to load prompt history:",
        error
      );

      setHistory([]);

      alert(
        "❌ Unable to load prompt history from the server."
      );
    } finally {
      setLoadingHistory(false);
    }
  };

  // =====================================
  // LOAD HISTORY WHEN PAGE OPENS
  // =====================================

  useEffect(() => {
    loadPromptHistory();
  }, [userId]);

  // =====================================
  // IMPROVE + SAVE PROMPT
  // =====================================

  const improvePrompt = async () => {
    const originalPrompt = prompt.trim();

    if (!originalPrompt) {
      alert("⚠️ Please enter a prompt.");
      return;
    }

    if (!userId) {
      alert(
        "❌ User ID not found. Please login again."
      );
      return;
    }

    // =================================
    // CREATE IMPROVED PROMPT
    // =================================

    const improved =
      `${originalPrompt}\n\n` +
      `Please provide a detailed, ` +
      `beginner-friendly explanation ` +
      `with clear examples, ` +
      `step-by-step reasoning, ` +
      `and practical guidance.`;

    setImprovedPrompt(improved);

    // =================================
    // CALCULATE PROMPT SCORE
    // =================================

    let promptScore = 50;

    if (originalPrompt.length > 20) {
      promptScore += 15;
    }

    if (originalPrompt.length > 50) {
      promptScore += 15;
    }

    const lowerPrompt =
      originalPrompt.toLowerCase();

    if (
      lowerPrompt.includes("example") ||
      lowerPrompt.includes("examples")
    ) {
      promptScore += 10;
    }

    if (lowerPrompt.includes("beginner")) {
      promptScore += 10;
    }

    promptScore = Math.min(
      promptScore,
      100
    );

    setScore(promptScore);

    // =================================
    // SAVE PROMPT TO MYSQL
    // =================================

    try {
      setSavingPrompt(true);

      const response = await fetch(
        `${API_BASE_URL}/prompt-history`,
        {
          method: "POST",

          headers: {
            "Content-Type": "application/json",
          },

          body: JSON.stringify({
            user_id: Number(userId),
            prompt: originalPrompt,
            favorite: false,
          }),
        }
      );

      const data = await response.json();

      if (!response.ok) {
        throw new Error(
          data.message ||
            "Failed to save prompt"
        );
      }

      console.log(
        "✅ Prompt saved:",
        data
      );

      // Reload history from MySQL
      await loadPromptHistory();

      // Record learning activity
      recordPromptActivity();

      // Clear input
      setPrompt("");

      alert(
        "🎉 Prompt improved and saved! +10 XP"
      );
    } catch (error) {
      console.error(
        "❌ Failed to save prompt:",
        error
      );

      alert(
        "❌ Prompt was improved, but could not be saved to the database."
      );
    } finally {
      setSavingPrompt(false);
    }
  };

  // =====================================
  // COPY IMPROVED PROMPT
  // =====================================

  const copyPrompt = async () => {
    if (!improvedPrompt) {
      alert("⚠️ Nothing to copy!");
      return;
    }

    try {
      await navigator.clipboard.writeText(
        improvedPrompt
      );

      alert("✅ Prompt copied!");
    } catch (error) {
      console.error(
        "❌ Copy failed:",
        error
      );

      alert(
        "❌ Unable to copy prompt."
      );
    }
  };

  // =====================================
  // DELETE ONE PROMPT
  // =====================================

  const deletePrompt = async (id: number) => {
    const confirmed = window.confirm(
      "Delete this prompt permanently?"
    );

    if (!confirmed) {
      return;
    }

    if (!userId) {
      alert(
        "❌ User ID not found. Please login again."
      );
      return;
    }

    try {
      const response = await fetch(
        `${API_BASE_URL}/prompt-history/${id}`,
        {
          method: "DELETE",

          headers: {
            "Content-Type": "application/json",
          },

          body: JSON.stringify({
            user_id: Number(userId),
          }),
        }
      );

      const data = await response.json();

      if (!response.ok) {
        throw new Error(
          data.message ||
            "Failed to delete prompt"
        );
      }

      setHistory((previous) =>
        previous.filter(
          (item) => item.id !== id
        )
      );

      console.log(
        "✅ Prompt deleted:",
        data
      );

      alert(
        "🗑️ Prompt deleted successfully."
      );
    } catch (error) {
      console.error(
        "❌ Failed to delete prompt:",
        error
      );

      alert(
        "❌ Could not delete prompt."
      );
    }
  };

  // =====================================
  // FAVORITE / UNFAVORITE PROMPT
  // =====================================

  const toggleFavorite = async (
    id: number
  ) => {
    const promptItem = history.find(
      (item) => item.id === id
    );

    if (!promptItem) {
      return;
    }

    if (!userId) {
      alert(
        "❌ User ID not found. Please login again."
      );
      return;
    }

    const newFavorite =
      !promptItem.favorite;

    try {
      /*
       * IMPORTANT:
       * Backend endpoint is:
       *
       * PUT /api/prompt-history/<prompt_id>
       *
       * NOT:
       *
       * /prompt-history/<id>/favorite
       */

      const response = await fetch(
        `${API_BASE_URL}/prompt-history/${id}`,
        {
          method: "PUT",

          headers: {
            "Content-Type":
              "application/json",
          },

          body: JSON.stringify({
            user_id: Number(userId),
            favorite: newFavorite,
          }),
        }
      );

      const data = await response.json();

      if (!response.ok) {
        throw new Error(
          data.message ||
            "Failed to update favorite"
        );
      }

      setHistory((previous) =>
        previous.map((item) =>
          item.id === id
            ? {
                ...item,
                favorite: newFavorite,
              }
            : item
        )
      );

      console.log(
        "✅ Favorite updated:",
        data
      );
    } catch (error) {
      console.error(
        "❌ Failed to update favorite:",
        error
      );

      alert(
        "❌ Could not update favorite."
      );
    }
  };

  // =====================================
  // CLEAR ALL HISTORY
  // =====================================

  const clearHistory = async () => {
    if (!userId) {
      alert(
        "❌ User ID not found. Please login again."
      );
      return;
    }

    const confirmed = window.confirm(
      "Clear ALL your prompt history permanently?"
    );

    if (!confirmed) {
      return;
    }

    try {
      /*
       * IMPORTANT:
       * Backend endpoint is:
       *
       * DELETE /api/prompt-history/clear/<user_id>
       */

      const response = await fetch(
        `${API_BASE_URL}/prompt-history/clear/${userId}`,
        {
          method: "DELETE",
        }
      );

      const data = await response.json();

      if (!response.ok) {
        throw new Error(
          data.message ||
            "Failed to clear history"
        );
      }

      setHistory([]);

      alert(
        `🗑️ History cleared successfully. ${
          data.deleted || 0
        } prompts deleted.`
      );
    } catch (error) {
      console.error(
        "❌ Failed to clear history:",
        error
      );

      alert(
        "❌ Could not clear prompt history."
      );
    }
  };

  // =====================================
  // SEARCH HISTORY
  // =====================================

  const searchText =
    search.toLowerCase();

  const filteredHistory =
    history.filter((item) =>
      String(item.text || "")
        .toLowerCase()
        .includes(searchText)
    );

  // =====================================
  // UI
  // =====================================

  return (
    <div className="prompt-lab-page">

      {/* PAGE HEADER */}

      <h1>🧠 Prompt Lab</h1>

      <p>
        Improve your AI prompts and
        track your prompt engineering
        progress.
      </p>

      {/* PROMPT INPUT */}

      <textarea
        rows={8}
        placeholder="Type your prompt here..."
        value={prompt}
        onChange={(event) =>
          setPrompt(event.target.value)
        }
        disabled={savingPrompt}
      />

      <br />
      <br />

      <button
        onClick={improvePrompt}
        disabled={savingPrompt}
      >
        {savingPrompt
          ? "⏳ Saving..."
          : "🚀 Improve Prompt"}
      </button>

      {/* IMPROVED PROMPT */}

      {improvedPrompt && (
        <div className="result-box">

          <h2>
            ✨ Improved Prompt
          </h2>

          <pre>
            {improvedPrompt}
          </pre>

          <button
            onClick={copyPrompt}
          >
            📋 Copy Prompt
          </button>

          <h3>
            ⭐ Prompt Score:{" "}
            {score}/100
          </h3>

        </div>
      )}

      {/* PROMPT HISTORY */}

      <div className="history-box">

        <h2>
          📝 Prompt History
        </h2>

        {/* SEARCH */}

        <input
          type="text"
          placeholder="🔍 Search prompts..."
          value={search}
          onChange={(event) =>
            setSearch(
              event.target.value
            )
          }
        />

        <br />
        <br />

        {/* LOADING */}

        {loadingHistory ? (
          <p>
            ⏳ Loading prompt history...
          </p>
        ) : history.length === 0 ? (
          <p>
            No prompts yet.
          </p>
        ) : filteredHistory.length === 0 ? (
          <p>
            No matching prompts found.
          </p>
        ) : (
          <>
            <ul>

              {filteredHistory.map(
                (item) => (
                  <li
                    key={item.id}
                    style={{
                      display: "flex",
                      alignItems: "center",
                      justifyContent:
                        "space-between",
                      gap: "10px",
                      marginBottom: "10px",
                    }}
                  >

                    {/* FAVORITE */}

                    <button
                      onClick={() =>
                        toggleFavorite(
                          item.id
                        )
                      }
                    >
                      {item.favorite
                        ? "⭐"
                        : "☆"}
                    </button>

                    {/* PROMPT */}

                    <span
                      style={{
                        flex: 1,
                      }}
                    >
                      {item.text}
                    </span>

                    {/* DELETE */}

                    <button
                      onClick={() =>
                        deletePrompt(
                          item.id
                        )
                      }
                    >
                      🗑️
                    </button>

                  </li>
                )
              )}

            </ul>

            {/* CLEAR ALL */}

            <button
              onClick={clearHistory}
            >
              🗑️ Clear History
            </button>
          </>
        )}

      </div>

    </div>
  );
}

export default PromptLabPage;