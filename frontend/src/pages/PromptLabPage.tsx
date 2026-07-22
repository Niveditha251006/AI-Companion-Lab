import "../styles/PromptLabPage.css";

function PromptLabPage() {
  return (
    <div className="prompt-page">
      <h1>🧠 Prompt Lab</h1>

      <p>
        Improve your prompts before sending them to an AI model.
      </p>

      <textarea
        placeholder="Type your prompt here..."
        rows={10}
      ></textarea>

      <button>Analyze Prompt</button>

      <div className="result-box">
        <h2>Prompt Score</h2>

        <p>-- / 10</p>

        <h3>Suggestions</h3>

        <ul>
          <li>Waiting for analysis...</li>
        </ul>
      </div>
    </div>
  );
}

export default PromptLabPage;