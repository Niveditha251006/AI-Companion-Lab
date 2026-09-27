import { useEffect, useState } from "react";

import { API_BASE_URL } from "../config";

type FactCheckResult = {
  id: number;
  claim: string;
  verdict: "Supported" | "Contradicted" | "Uncertain";
  confidence: number;
  explanation: string;
  evidence: string;
  source_url: string | null;
};

type FactCheckHistory = FactCheckResult & {
  created_at: string;
};

const FactCheckerPage = () => {
  const [claim, setClaim] = useState("");
  const [result, setResult] = useState<FactCheckResult | null>(null);
  const [history, setHistory] = useState<FactCheckHistory[]>([]);
  const [loading, setLoading] = useState(false);
  const [historyLoading, setHistoryLoading] = useState(true);
  const [error, setError] = useState("");

  const getAuthHeaders = () => ({
    "Content-Type": "application/json",
    Authorization: `Bearer ${localStorage.getItem("authToken")}`,
  });

  const loadHistory = async () => {
    try {
      setHistoryLoading(true);

      const response = await fetch(
        `${API_BASE_URL}/fact-check/history`,
        {
          headers: getAuthHeaders(),
        }
      );

      const data = await response.json();

      if (!response.ok) {
        throw new Error(
          data.message || "Failed to load fact-check history"
        );
      }

      setHistory(data);
    } catch (error) {
      console.error("Fact-check history error:", error);
    } finally {
      setHistoryLoading(false);
    }
  };

  useEffect(() => {
    loadHistory();
  }, []);

  const handleFactCheck = async () => {
    const trimmedClaim = claim.trim();

    if (!trimmedClaim) {
      setError("Please enter a claim to fact-check.");
      return;
    }

    setLoading(true);
    setError("");
    setResult(null);

    try {
      const response = await fetch(
        `${API_BASE_URL}/fact-check`,
        {
          method: "POST",
          headers: getAuthHeaders(),
          body: JSON.stringify({
            claim: trimmedClaim,
          }),
        }
      );

      const data = await response.json();

      if (!response.ok) {
        throw new Error(
          data.message || "Fact-checking failed."
        );
      }

      setResult(data);
      setClaim("");
      await loadHistory();
    } catch (error) {
      console.error("Fact-check error:", error);

      if (error instanceof Error) {
        setError(error.message);
      } else {
        setError("Something went wrong while fact-checking.");
      }
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async (id: number) => {
    try {
      const response = await fetch(
        `${API_BASE_URL}/fact-check/${id}`,
        {
          method: "DELETE",
          headers: getAuthHeaders(),
        }
      );

      const data = await response.json();

      if (!response.ok) {
        throw new Error(
          data.message || "Failed to delete fact check."
        );
      }

      setHistory((previous) =>
        previous.filter((item) => item.id !== id)
      );

      if (result?.id === id) {
        setResult(null);
      }
    } catch (error) {
      console.error("Delete fact-check error:", error);
      setError(
        error instanceof Error
          ? error.message
          : "Failed to delete fact check."
      );
    }
  };

  const getVerdictClass = (
    verdict: FactCheckResult["verdict"]
  ) => {
    if (verdict === "Supported") return "supported";
    if (verdict === "Contradicted") return "contradicted";
    return "uncertain";
  };

  return (
    <div className="fact-checker-page">
      <div className="fact-checker-header">
        <div>
          <h1>AI Fact Checker</h1>
          <p>
            Check claims against retrieved evidence and
            understand why the AI reached its conclusion.
          </p>
        </div>
      </div>

      <section className="fact-checker-card">
        <label htmlFor="claim">
          Enter a claim
        </label>

        <textarea
          id="claim"
          value={claim}
          onChange={(event) => setClaim(event.target.value)}
          placeholder="Example: Python is a programming language"
          rows={5}
          disabled={loading}
        />

        {error && (
          <p className="fact-checker-error">
            {error}
          </p>
        )}

        <button
          type="button"
          onClick={handleFactCheck}
          disabled={loading}
        >
          {loading ? "Checking..." : "Check Claim"}
        </button>
      </section>

      {result && (
        <section className="fact-check-result">
          <div className="result-header">
            <span
              className={`verdict-badge ${getVerdictClass(
                result.verdict
              )}`}
            >
              {result.verdict}
            </span>

            <span className="confidence">
              Confidence: {result.confidence}%
            </span>
          </div>

          <h2>Claim</h2>
          <p>{result.claim}</p>

          <h2>Why?</h2>
          <p>{result.explanation}</p>

          <h2>Evidence</h2>
          <p>{result.evidence}</p>

          {result.source_url && (
            <a
              href={result.source_url}
              target="_blank"
              rel="noopener noreferrer"
            >
              View Source
            </a>
          )}
        </section>
      )}

      <section className="fact-check-history">
        <div className="history-header">
          <h2>Fact-check History</h2>
          <span>{history.length} checks</span>
        </div>

        {historyLoading ? (
          <p>Loading history...</p>
        ) : history.length === 0 ? (
          <p>No fact checks yet.</p>
        ) : (
          <div className="history-list">
            {history.map((item) => (
              <article
                key={item.id}
                className="history-item"
              >
                <div className="history-item-top">
                  <span
                    className={`verdict-badge ${getVerdictClass(
                      item.verdict
                    )}`}
                  >
                    {item.verdict}
                  </span>

                  <span>
                    {item.confidence}%
                  </span>
                </div>

                <p>{item.claim}</p>

                <div className="history-item-actions">
                  <button
                    type="button"
                    onClick={() => setResult(item)}
                  >
                    View
                  </button>

                  <button
                    type="button"
                    onClick={() => handleDelete(item.id)}
                  >
                    Delete
                  </button>
                </div>
              </article>
            ))}
          </div>
        )}
      </section>
    </div>
  );
};

export default FactCheckerPage;