import { useEffect, useState } from "react";
import "../styles/InsightsPage.css";

type User = {
  id: number;
  name: string;
  email: string;
};

type Statistics = {
  total_analyses: number;
  total_words: number;
  total_characters: number;
  total_sentences: number;
  total_questions: number;
  total_paragraphs: number;
  average_readability: number;
  average_reading_time: number;
  average_words: number;
};

type Analysis = {
  id: number;
  words: number;
  characters?: number;
  sentences: number;
  questions: number;
  paragraphs: number;
  readability: number;
  longest_word?: string;
  reading_time: number;
  created_at: string;
};

type TrendItem = {
  created_at?: string;
  date?: string;
  readability?: number;
  words?: number;
};

type InsightsData = {
  user: User;
  statistics: Statistics;
  recent_analyses: Analysis[];
  readability_trend: TrendItem[];
  word_trend: TrendItem[];
  best_analysis: Analysis | null;
  longest_analysis: Analysis | null;
};

function InsightPage() {
  const [data, setData] = useState<InsightsData | null>(null);

  const [loading, setLoading] = useState(true);

  const [error, setError] = useState("");

  const userId = localStorage.getItem("userId") || "";

  const loadInsights = async () => {
    if (!userId) {
      setError("User ID not found. Please login again.");
      setLoading(false);
      return;
    }

    try {
      setLoading(true);
      setError("");

      const response = await fetch(
        `http://127.0.0.1:5000/api/insights/${userId}`
      );

      const result = await response.json();

      if (!response.ok) {
        throw new Error(
          result.message || "Failed to load conversation insights."
        );
      }

      setData(result);
    } catch (err) {
      console.error("Insights error:", err);

      setError(
        err instanceof Error
          ? err.message
          : "Unable to load conversation insights."
      );
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadInsights();
  }, [userId]);

  const formatDate = (date: string) => {
    if (!date) {
      return "Unknown date";
    }

    const parsedDate = new Date(date);

    if (Number.isNaN(parsedDate.getTime())) {
      return date;
    }

    return parsedDate.toLocaleString();
  };

  // =========================================
  // LOADING
  // =========================================

  if (loading) {
    return (
      <div className="insights-page">
        <div className="insights-loading">
          <h2>⏳ Loading Insights...</h2>
          <p>
            Analyzing your conversation history.
          </p>
        </div>
      </div>
    );
  }

  // =========================================
  // ERROR
  // =========================================

  if (error) {
    return (
      <div className="insights-page">
        <div className="insights-error">
          <h2>❌ Unable to Load Insights</h2>

          <p>{error}</p>

          <button onClick={loadInsights}>
            🔄 Try Again
          </button>
        </div>
      </div>
    );
  }

  // =========================================
  // NO DATA
  // =========================================

  if (!data) {
    return (
      <div className="insights-page">
        <div className="insights-empty">
          <h2>📊 No Insights Available</h2>

          <p>
            Analyze a conversation first to generate
            insights.
          </p>
        </div>
      </div>
    );
  }

  const { user, statistics } = data;

  const hasAnalyses =
    statistics.total_analyses > 0;

  // =========================================
  // PAGE
  // =========================================

  return (
    <div className="insights-page">

      {/* =====================================
          HEADER
      ===================================== */}

      <div className="insights-header">

        <div>
          <h1>📊 Conversation Insights</h1>

          <p>
            Understand your conversation habits,
            readability, and writing patterns.
          </p>
        </div>

        <div className="insights-user">

          <div className="insights-user-icon">
            👤
          </div>

          <div>
            <strong>{user.name}</strong>

            <small>{user.email}</small>
          </div>

        </div>

      </div>


      {/* =====================================
          NO ANALYSIS DATA
      ===================================== */}

      {!hasAnalyses ? (
        <div className="insights-no-data">

          <h2>📭 No Analysis Data Yet</h2>

          <p>
            Go to Chat Analyzer and analyze your
            first conversation.
          </p>

        </div>
      ) : (
        <>

          {/* =====================================
              OVERALL STATISTICS
          ===================================== */}

          <section className="insights-section">

            <h2>📈 Overall Statistics</h2>

            <div className="insights-stats-grid">

              <div className="insights-stat-card">
                <span>📊</span>

                <h3>Total Analyses</h3>

                <strong>
                  {statistics.total_analyses}
                </strong>
              </div>


              <div className="insights-stat-card">
                <span>📝</span>

                <h3>Total Words</h3>

                <strong>
                  {statistics.total_words.toLocaleString()}
                </strong>
              </div>


              <div className="insights-stat-card">
                <span>🔤</span>

                <h3>Total Characters</h3>

                <strong>
                  {statistics.total_characters.toLocaleString()}
                </strong>
              </div>


              <div className="insights-stat-card">
                <span>📄</span>

                <h3>Total Sentences</h3>

                <strong>
                  {statistics.total_sentences}
                </strong>
              </div>


              <div className="insights-stat-card">
                <span>❓</span>

                <h3>Total Questions</h3>

                <strong>
                  {statistics.total_questions}
                </strong>
              </div>


              <div className="insights-stat-card">
                <span>📑</span>

                <h3>Total Paragraphs</h3>

                <strong>
                  {statistics.total_paragraphs}
                </strong>
              </div>


              <div className="insights-stat-card">
                <span>⭐</span>

                <h3>Avg. Readability</h3>

                <strong>
                  {statistics.average_readability}/100
                </strong>
              </div>


              <div className="insights-stat-card">
                <span>⏱️</span>

                <h3>Avg. Reading Time</h3>

                <strong>
                  {statistics.average_reading_time} min
                </strong>
              </div>

            </div>

          </section>


          {/* =====================================
              HIGHLIGHTS
          ===================================== */}

          <section className="insights-section">

            <h2>🏆 Highlights</h2>

            <div className="insights-highlight-grid">

              {/* BEST ANALYSIS */}

              <div className="insights-highlight-card">

                <div className="highlight-icon">
                  ⭐
                </div>

                <div>

                  <h3>Best Readability</h3>

                  {data.best_analysis ? (
                    <>
                      <strong>
                        {data.best_analysis.readability}/100
                      </strong>

                      <p>
                        {data.best_analysis.words} words
                        {" • "}
                        {data.best_analysis.questions} questions
                      </p>

                      <small>
                        {formatDate(
                          data.best_analysis.created_at
                        )}
                      </small>
                    </>
                  ) : (
                    <p>No data available.</p>
                  )}

                </div>

              </div>


              {/* MOST WORDS */}

              <div className="insights-highlight-card">

                <div className="highlight-icon">
                  📝
                </div>

                <div>

                  <h3>Longest Analysis</h3>

                  {data.longest_analysis ? (
                    <>
                      <strong>
                        {data.longest_analysis.words} words
                      </strong>

                      <p>
                        Readability:{" "}
                        {data.longest_analysis.readability}/100
                      </p>

                      <small>
                        {formatDate(
                          data.longest_analysis.created_at
                        )}
                      </small>
                    </>
                  ) : (
                    <p>No data available.</p>
                  )}

                </div>

              </div>

            </div>

          </section>


          {/* =====================================
              SUMMARY
          ===================================== */}

          <section className="insights-summary">

            <h2>💡 Your Conversation Summary</h2>

            <p>
              You have analyzed{" "}
              <strong>
                {statistics.total_analyses}
              </strong>{" "}
              conversation
              {statistics.total_analyses === 1
                ? ""
                : "s"}{" "}
              containing a total of{" "}
              <strong>
                {statistics.total_words.toLocaleString()}
              </strong>{" "}
              words.
            </p>

            <p>
              Your average readability score is{" "}
              <strong>
                {statistics.average_readability}/100
              </strong>
              .
            </p>

            <p>
              Your conversations contain an average
              of{" "}
              <strong>
                {statistics.average_words}
              </strong>{" "}
              words per analysis.
            </p>

          </section>


          {/* =====================================
              RECENT ANALYSES
          ===================================== */}

          <section className="insights-section">

            <h2>🕒 Recent Analyses</h2>

            <div className="recent-analyses">

              {data.recent_analyses.length === 0 ? (
                <p>No recent analyses.</p>
              ) : (
                data.recent_analyses.map(
                  (analysis) => (

                    <div
                      className="recent-analysis-card"
                      key={analysis.id}
                    >

                      <div>

                        <h3>
                          📊 {analysis.words} words
                        </h3>

                        <p>
                          {analysis.sentences} sentences
                          {" • "}
                          {analysis.questions} questions
                          {" • "}
                          {analysis.paragraphs} paragraphs
                        </p>

                        <p>
                          ⭐ Readability:{" "}
                          {analysis.readability}/100
                        </p>

                        <small>
                          🕒{" "}
                          {formatDate(
                            analysis.created_at
                          )}
                        </small>

                      </div>

                      <div className="recent-analysis-score">

                        <strong>
                          {analysis.readability}
                        </strong>

                        <span>
                          /100
                        </span>

                      </div>

                    </div>

                  )
                )
              )}

            </div>

          </section>


          {/* =====================================
              READABILITY TREND
          ===================================== */}

          <section className="insights-section">

            <h2>📈 Readability Trend</h2>

            {data.readability_trend.length === 0 ? (
              <div className="insights-empty">
                <p>
                  Not enough data to show a trend.
                </p>
              </div>
            ) : (
              <div className="trend-list">

                {data.readability_trend.map(
                  (item, index) => (

                    <div
                      className="trend-item"
                      key={`${item.date || item.created_at}-${index}`}
                    >

                      <div>
                        <strong>
                          {item.readability ?? 0}/100
                        </strong>

                        <small>
                          {formatDate(
                            item.date ||
                              item.created_at ||
                              ""
                          )}
                        </small>
                      </div>

                      <div className="trend-bar">

                        <div
                          className="trend-bar-fill"
                          style={{
                            width: `${Math.max(
                              0,
                              Math.min(
                                100,
                                Number(
                                  item.readability || 0
                                )
                              )
                            )}%`,
                          }}
                        />

                      </div>

                    </div>

                  )
                )}

              </div>
            )}

          </section>


          {/* =====================================
              WORD COUNT TREND
          ===================================== */}

          <section className="insights-section">

            <h2>📝 Word Count Trend</h2>

            {data.word_trend.length === 0 ? (
              <div className="insights-empty">
                <p>
                  Not enough data to show a trend.
                </p>
              </div>
            ) : (
              <div className="trend-list">

                {data.word_trend.map(
                  (item, index) => {

                    const maxWords = Math.max(
                      ...data.word_trend.map(
                        (trend) =>
                          Number(trend.words || 0)
                      ),
                      1
                    );

                    const currentWords =
                      Number(item.words || 0);

                    const width =
                      (currentWords / maxWords) * 100;

                    return (
                      <div
                        className="trend-item"
                        key={`${item.date || item.created_at}-${index}`}
                      >

                        <div>

                          <strong>
                            {currentWords} words
                          </strong>

                          <small>
                            {formatDate(
                              item.date ||
                                item.created_at ||
                                ""
                            )}
                          </small>

                        </div>

                        <div className="trend-bar">

                          <div
                            className="trend-bar-fill"
                            style={{
                              width: `${width}%`,
                            }}
                          />

                        </div>

                      </div>
                    );
                  }
                )}

              </div>
            )}

          </section>

        </>
      )}

    </div>
  );
}

export default InsightPage;