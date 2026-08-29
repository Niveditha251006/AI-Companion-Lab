import { useEffect, useState } from "react";
import "../styles/ChatAnalyzerPage.css";

type AnalysisHistory = {
  id: number;
  user_id: number;
  words: number;
  characters: number;
  sentences: number;
  questions: number;
  paragraphs: number;
  readability: number;
  longest_word: string;
  reading_time: number;
  created_at: string;
};

const API_BASE_URL = "http://127.0.0.1:5000/api";

function ChatAnalyzerPage() {
  const [conversation, setConversation] = useState("");

  const [wordCount, setWordCount] = useState(0);
  const [charCount, setCharCount] = useState(0);
  const [sentenceCount, setSentenceCount] = useState(0);
  const [readingTime, setReadingTime] = useState(0);
  const [longestWord, setLongestWord] = useState("");
  const [questionCount, setQuestionCount] = useState(0);
  const [paragraphCount, setParagraphCount] = useState(0);
  const [readabilityScore, setReadabilityScore] = useState(0);

  const [suggestions, setSuggestions] = useState<string[]>([]);
  const [analyzed, setAnalyzed] = useState(false);

  const [history, setHistory] = useState<AnalysisHistory[]>([]);

  const [loadingHistory, setLoadingHistory] = useState(false);
  const [savingAnalysis, setSavingAnalysis] = useState(false);

  // =====================================
  // LOGGED-IN USER
  // =====================================

  const userId = localStorage.getItem("userId") || "";

  // =====================================
  // LOAD ANALYSIS HISTORY
  // =====================================

  const loadHistory = async () => {
    if (!userId) {
      console.error("User ID not found.");
      return;
    }

    try {
      setLoadingHistory(true);

      const response = await fetch(
        `${API_BASE_URL}/chat-analysis/${userId}`
      );

      const data = await response.json();

      if (!response.ok) {
        throw new Error(
          data.message || "Failed to load analysis history."
        );
      }

      setHistory(
        Array.isArray(data.history)
          ? data.history
          : []
      );
    } catch (error) {
      console.error("❌ Load history error:", error);

      alert(
        "❌ Unable to load analysis history. Make sure Flask is running."
      );

      setHistory([]);
    } finally {
      setLoadingHistory(false);
    }
  };

  // =====================================
  // LOAD HISTORY WHEN PAGE OPENS
  // =====================================

  useEffect(() => {
    loadHistory();
  }, [userId]);

  // =====================================
  // ANALYZE CONVERSATION
  // =====================================

  const analyzeConversation = async () => {
    const text = conversation.trim();

    if (!text) {
      alert("⚠️ Please paste a conversation first.");
      return;
    }

    if (!userId) {
      alert("❌ User ID not found. Please login again.");
      return;
    }

    // =====================================
    // CHARACTERS
    // =====================================

    const characters = text.length;

    // =====================================
    // WORDS
    // =====================================

    const wordArray = text
      .split(/\s+/)
      .filter(Boolean);

    const words = wordArray.length;

    // =====================================
    // SENTENCES
    // =====================================

    const sentenceArray = text
      .split(/[.!?]+/)
      .map((sentence) => sentence.trim())
      .filter(Boolean);

    const sentences = sentenceArray.length;

    // =====================================
    // READING TIME
    // =====================================

    const readingMinutes =
      words > 0
        ? Math.max(1, Math.ceil(words / 200))
        : 0;

    // =====================================
    // LONGEST WORD
    // =====================================

    let longest = "";

    for (const word of wordArray) {
      const cleanWord = word.replace(
        /[^\p{L}\p{N}]/gu,
        ""
      );

      if (cleanWord.length > longest.length) {
        longest = cleanWord;
      }
    }

    // =====================================
    // QUESTIONS
    // =====================================

    const questions =
      (text.match(/\?/g) || []).length;

    // =====================================
    // PARAGRAPHS
    // =====================================

    const paragraphs = text
      .split(/\n\s*\n/)
      .map((paragraph) => paragraph.trim())
      .filter(Boolean);

    const paragraphTotal = paragraphs.length;

    // =====================================
    // READABILITY
    // =====================================

    let score = 100;

    const averageSentenceLength =
      sentences > 0
        ? words / sentences
        : words;

    if (averageSentenceLength > 25) {
      score -= 20;
    } else if (averageSentenceLength > 18) {
      score -= 10;
    }

    const longWords = wordArray.filter((word) => {
      const cleanWord = word.replace(
        /[^\p{L}\p{N}]/gu,
        ""
      );

      return cleanWord.length > 10;
    }).length;

    if (longWords > 5) {
      score -= 15;
    } else if (longWords > 2) {
      score -= 5;
    }

    if (words > 500) {
      score -= 10;
    }

    score = Math.max(
      0,
      Math.min(100, score)
    );

    // =====================================
    // SUGGESTIONS
    // =====================================

    const newSuggestions: string[] = [];

    if (averageSentenceLength > 25) {
      newSuggestions.push(
        "💡 Try using shorter sentences."
      );
    } else if (averageSentenceLength > 18) {
      newSuggestions.push(
        "💡 Some sentences are long. Consider splitting them."
      );
    }

    if (questions === 0) {
      newSuggestions.push(
        "💡 Consider asking specific questions to get more useful AI responses."
      );
    }

    if (words < 10) {
      newSuggestions.push(
        "💡 Add more context to your conversation."
      );
    }

    if (longWords > 5) {
      newSuggestions.push(
        "💡 Consider using simpler words where possible."
      );
    }

    if (paragraphTotal > 8) {
      newSuggestions.push(
        "💡 Consider organizing the conversation into smaller sections."
      );
    }

    if (newSuggestions.length === 0) {
      newSuggestions.push(
        "🎉 Great! Your conversation looks clear and well structured."
      );
    }

    // =====================================
    // UPDATE SCREEN
    // =====================================

    setCharCount(characters);
    setWordCount(words);
    setSentenceCount(sentences);
    setReadingTime(readingMinutes);
    setLongestWord(longest);
    setQuestionCount(questions);
    setParagraphCount(paragraphTotal);
    setReadabilityScore(score);
    setSuggestions(newSuggestions);
    setAnalyzed(true);

    // =====================================
    // SAVE TO DATABASE
    // =====================================

    try {
      setSavingAnalysis(true);

      const response = await fetch(
        `${API_BASE_URL}/chat-analysis`,
        {
          method: "POST",

          headers: {
            "Content-Type": "application/json",
          },

          body: JSON.stringify({
            user_id: Number(userId),
            words,
            characters,
            sentences,
            questions,
            paragraphs: paragraphTotal,
            readability: score,
            longest_word: longest,
            reading_time: readingMinutes,
          }),
        }
      );

      const data = await response.json();

      if (!response.ok) {
        throw new Error(
          data.message || "Failed to save analysis."
        );
      }

      console.log(
        "✅ Analysis saved:",
        data
      );

      // Reload actual database history
      await loadHistory();

      alert(
        "🎉 Conversation analyzed and saved successfully!"
      );
    } catch (error) {
      console.error(
        "❌ Save analysis error:",
        error
      );

      alert(
        "❌ Analysis was completed, but it could not be saved to the database."
      );
    } finally {
      setSavingAnalysis(false);
    }
  };

  // =====================================
  // CLEAR CURRENT ANALYSIS
  // =====================================

  const clearConversation = () => {
    setConversation("");

    setWordCount(0);
    setCharCount(0);
    setSentenceCount(0);
    setReadingTime(0);
    setLongestWord("");
    setQuestionCount(0);
    setParagraphCount(0);
    setReadabilityScore(0);

    setSuggestions([]);
    setAnalyzed(false);
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

    if (history.length === 0) {
      return;
    }

    const confirmed = window.confirm(
      "Clear all analysis history permanently?"
    );

    if (!confirmed) {
      return;
    }

    try {
      const response = await fetch(
        `${API_BASE_URL}/chat-analysis/user/${userId}`,
        {
          method: "DELETE",
        }
      );

      const data = await response.json();

      if (!response.ok) {
        throw new Error(
          data.message ||
            "Failed to clear analysis history."
        );
      }

      setHistory([]);

      alert(
        `🗑️ Analysis history cleared. ${
          data.deleted ?? 0
        } records deleted.`
      );
    } catch (error) {
      console.error(
        "❌ Clear history error:",
        error
      );

      alert(
        "❌ Unable to clear analysis history."
      );
    }
  };

  // =====================================
  // DELETE ONE HISTORY ITEM
  // =====================================

  // =====================================
// DELETE ONE HISTORY ITEM
// =====================================

const deleteHistoryItem = async (
  id: number
) => {
  if (!userId) {
    alert(
      "❌ User ID not found. Please login again."
    );
    return;
  }

  const confirmed = window.confirm(
    "Delete this analysis permanently?"
  );

  if (!confirmed) {
    return;
  }

  try {
    const response = await fetch(
      `${API_BASE_URL}/chat-analysis/${id}`,
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
          "Failed to delete analysis."
      );
    }

    setHistory((previous) =>
      previous.filter(
        (item) => item.id !== id
      )
    );

    alert(
      "🗑️ Analysis deleted successfully."
    );
  } catch (error) {
    console.error(
      "❌ Delete analysis error:",
      error
    );

    alert(
      "❌ Unable to delete analysis."
    );
  }
};
      

  // =====================================
  // RENDER
  // =====================================

  return (
    <div className="chat-analyzer-page">

      <h1>🔍 Chat Analyzer</h1>

      <p>
        Paste your AI conversation below
        and analyze its structure and
        readability.
      </p>

      {/* INPUT */}

      <textarea
        rows={10}
        placeholder="Paste your ChatGPT conversation here..."
        value={conversation}
        onChange={(event) =>
          setConversation(event.target.value)
        }
        disabled={savingAnalysis}
      />

      {/* BUTTONS */}

      <div className="analyzer-buttons">

        <button
          onClick={analyzeConversation}
          disabled={savingAnalysis}
        >
          {savingAnalysis
            ? "⏳ Saving..."
            : "🔍 Analyze Conversation"}
        </button>

        <button
          onClick={clearConversation}
          disabled={savingAnalysis}
        >
          🗑️ Clear
        </button>

      </div>

      {/* RESULTS */}

      {analyzed && (
        <div className="result-box">

          <h2>📊 Analysis Result</h2>

          <div className="analysis-grid">

            <div className="analysis-card">
              <span>📖</span>
              <h3>Reading Time</h3>
              <p>{readingTime} min</p>
            </div>

            <div className="analysis-card">
              <span>🔤</span>
              <h3>Longest Word</h3>
              <p>
                {longestWord || "N/A"}
              </p>
            </div>

            <div className="analysis-card">
              <span>📝</span>
              <h3>Words</h3>
              <p>{wordCount}</p>
            </div>

            <div className="analysis-card">
              <span>🔠</span>
              <h3>Characters</h3>
              <p>{charCount}</p>
            </div>

            <div className="analysis-card">
              <span>📄</span>
              <h3>Sentences</h3>
              <p>{sentenceCount}</p>
            </div>

            <div className="analysis-card">
              <span>❓</span>
              <h3>Questions</h3>
              <p>{questionCount}</p>
            </div>

            <div className="analysis-card">
              <span>📑</span>
              <h3>Paragraphs</h3>
              <p>{paragraphCount}</p>
            </div>

            <div className="analysis-card">
              <span>⭐</span>
              <h3>Readability</h3>
              <p>
                {readabilityScore}/100
              </p>
            </div>

          </div>

          {/* SUGGESTIONS */}

          <div className="suggestions-box">

            <h2>💡 Suggestions</h2>

            {suggestions.map(
              (suggestion, index) => (
                <p key={index}>
                  {suggestion}
                </p>
              )
            )}

          </div>

        </div>
      )}

      {/* HISTORY */}

      <div className="history-box">

        <div className="history-header">

          <h2>📊 Analysis History</h2>

          <button
            onClick={clearHistory}
            disabled={
              loadingHistory ||
              history.length === 0
            }
          >
            🗑️ Clear History
          </button>

        </div>

        {loadingHistory ? (
          <p>
            ⏳ Loading history...
          </p>
        ) : history.length === 0 ? (
          <p>
            No analysis history yet.
          </p>
        ) : (
          history.map((item) => (

            <div
              key={item.id}
              className="analysis-history-item"
            >

              <div>

                <strong>
                  📊 {item.words} words
                </strong>

                <p>
                  {item.sentences} sentences
                  {" • "}
                  {item.questions} questions
                  {" • "}
                  {item.paragraphs} paragraphs
                </p>

                <p>
                  🔠 Characters:{" "}
                  {item.characters}
                </p>

                <p>
                  📊 Readability:{" "}
                  {item.readability}/100
                </p>

                <p>
                  🔤 Longest word:{" "}
                  {item.longest_word || "N/A"}
                </p>

                <p>
                  ⏱️ Reading time:{" "}
                  {item.reading_time} min
                </p>

                <small>
                  🕒{" "}
                  {item.created_at
                    ? new Date(
                        item.created_at
                      ).toLocaleString()
                    : "Unknown date"}
                </small>

              </div>

              <button
                onClick={() =>
                  deleteHistoryItem(
                    item.id
                  )
                }
              >
                🗑️
              </button>

            </div>

          ))
        )}

      </div>

    </div>
  );
}

export default ChatAnalyzerPage;