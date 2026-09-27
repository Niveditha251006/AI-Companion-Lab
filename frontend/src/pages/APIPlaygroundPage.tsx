import { useState } from "react";

type Endpoint = {
  name: string;
  method: "GET" | "POST";
  path: string;
  description: string;
  requiresAuth: boolean;
  exampleBody?: string;
};

const endpoints: Endpoint[] = [
  {
    name: "Dashboard",
    method: "GET",
    path: "/dashboard",
    description:
      "Fetch your dashboard statistics using the authenticated user.",
    requiresAuth: true,
  },
  {
    name: "Fact Check History",
    method: "GET",
    path: "/fact-check/history",
    description:
      "Retrieve your saved AI fact-check results.",
    requiresAuth: true,
  },
  {
    name: "Fact Check",
    method: "POST",
    path: "/fact-check",
    description:
      "Submit a claim and receive an evidence-based AI analysis.",
    requiresAuth: true,
    exampleBody: JSON.stringify(
      {
        claim: "Python is a programming language",
      },
      null,
      2
    ),
  },
  {
    name: "Learning Progress",
    method: "GET",
    path: "/learning/1",
    description:
      "Retrieve learning progress for a user.",
    requiresAuth: false,
  },
];

import { API_BASE_URL } from "../config";

const APIPlaygroundPage = () => {
  const [selectedIndex, setSelectedIndex] = useState(0);
  const [requestBody, setRequestBody] = useState("");
  const [responseData, setResponseData] = useState("");
  const [status, setStatus] = useState<number | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const selectedEndpoint = endpoints[selectedIndex];

  const selectEndpoint = (index: number) => {
    setSelectedIndex(index);

    const endpoint = endpoints[index];

    setRequestBody(endpoint.exampleBody || "");
    setResponseData("");
    setStatus(null);
    setError("");
  };

  const sendRequest = async () => {
    setLoading(true);
    setResponseData("");
    setStatus(null);
    setError("");

    try {
      const headers: Record<string, string> = {
        "Content-Type": "application/json",
      };

      if (selectedEndpoint.requiresAuth) {
        const token = localStorage.getItem("authToken");

        if (!token) {
          throw new Error(
            "You are not logged in. Please log in first."
          );
        }

        headers.Authorization = `Bearer ${token}`;
      }

      const options: RequestInit = {
        method: selectedEndpoint.method,
        headers,
      };

      if (selectedEndpoint.method === "POST") {
        if (!requestBody.trim()) {
          throw new Error(
            "Please enter a JSON request body."
          );
        }

        try {
          JSON.parse(requestBody);
        } catch {
          throw new Error(
            "Request body is not valid JSON."
          );
        }

        options.body = requestBody;
      }

      const response = await fetch(
        `${API_BASE_URL}${selectedEndpoint.path}`,
        options
      );

      setStatus(response.status);

      const contentType =
        response.headers.get("content-type") || "";

      if (contentType.includes("application/json")) {
        const data = await response.json();

        setResponseData(
          JSON.stringify(data, null, 2)
        );
      } else {
        const text = await response.text();

        setResponseData(text);
      }
    } catch (error) {
      console.error("API Playground error:", error);

      setError(
        error instanceof Error
          ? error.message
          : "Request failed."
      );
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="api-playground-page">
      <div className="api-playground-header">
        <div>
          <h1>API Playground</h1>

          <p>
            Explore your application's backend APIs and see
            how requests, authentication, HTTP status codes,
            and JSON responses work.
          </p>
        </div>
      </div>

      <div className="api-playground-layout">
        <aside className="api-endpoints">
          <h2>Endpoints</h2>

          {endpoints.map((endpoint, index) => (
            <button
              key={endpoint.name}
              type="button"
              className={
                selectedIndex === index
                  ? "endpoint-button active"
                  : "endpoint-button"
              }
              onClick={() => selectEndpoint(index)}
            >
              <span className="endpoint-method">
                {endpoint.method}
              </span>

              <span>
                <strong>{endpoint.name}</strong>

                <small>{endpoint.path}</small>
              </span>
            </button>
          ))}
        </aside>

        <main className="api-request-panel">
          <div className="request-header">
            <div>
              <span
                className={`method-badge ${selectedEndpoint.method.toLowerCase()}`}
              >
                {selectedEndpoint.method}
              </span>

              <code>{selectedEndpoint.path}</code>
            </div>

            {selectedEndpoint.requiresAuth && (
              <span className="auth-badge">
                🔐 JWT Required
              </span>
            )}
          </div>

          <p className="endpoint-description">
            {selectedEndpoint.description}
          </p>

          {selectedEndpoint.method === "POST" && (
            <section className="request-body-section">
              <h3>Request Body</h3>

              <textarea
                value={requestBody}
                onChange={(event) =>
                  setRequestBody(event.target.value)
                }
                rows={10}
                placeholder='{"key": "value"}'
                disabled={loading}
              />
            </section>
          )}

          <button
            type="button"
            className="send-request-button"
            onClick={sendRequest}
            disabled={loading}
          >
            {loading ? "Sending..." : "Send Request"}
          </button>

          {error && (
            <div className="api-error">
              <strong>Error</strong>
              <p>{error}</p>
            </div>
          )}

          {status !== null && (
            <section className="api-response-section">
              <div className="response-header">
                <h3>Response</h3>

                <span
                  className={
                    status >= 200 && status < 300
                      ? "status-success"
                      : "status-error"
                  }
                >
                  HTTP {status}
                </span>
              </div>

              <pre>
                {responseData || "No response body"}
              </pre>
            </section>
          )}
        </main>
      </div>

      <section className="api-learning-card">
        <h2>What are you learning?</h2>

        <div className="api-learning-grid">
          <div>
            <h3>Request</h3>
            <p>
              The frontend sends an HTTP request to a Flask
              backend endpoint.
            </p>
          </div>

          <div>
            <h3>Authentication</h3>
            <p>
              Protected endpoints use your JWT token to
              identify the logged-in user.
            </p>
          </div>

          <div>
            <h3>Response</h3>
            <p>
              The backend returns a status code and usually
              structured JSON data.
            </p>
          </div>
        </div>
      </section>
    </div>
  );
};

export default APIPlaygroundPage;