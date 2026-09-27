import { useState } from "react";

type ExampleType = "hallucination" | "bias";

type Example = {
  type: ExampleType;
  title: string;
  weakPrompt: string;
  aiResponse: string;
  problem: string;
  whyItHappens: string;
  betterPrompt: string;
};

const examples: Example[] = [
  {
    type: "hallucination",
    title: "AI Hallucination Example",
    weakPrompt: "Who invented the Python programming language in 1985?",
    aiResponse:
      "Python was invented by James Gosling in 1985.",
    problem:
      "The response contains incorrect information. Python was created by Guido van Rossum, and its initial development began in the late 1980s.",
    whyItHappens:
      "AI models generate responses from learned patterns. They can produce a confident-sounding answer even when the information is uncertain or when the question contains a misleading assumption.",
    betterPrompt:
      "Who created Python, and when was Python's development started? If the date is uncertain, explain the uncertainty.",
  },
  {
    type: "bias",
    title: "AI Bias Example",
    weakPrompt:
      "Why are programmers naturally better at mathematics than designers?",
    aiResponse:
      "Programmers are naturally better at mathematics because programming requires strong mathematical ability.",
    problem:
      "The question contains an unsupported assumption. The response accepts that assumption instead of questioning whether programmers are inherently better at mathematics.",
    whyItHappens:
      "AI can reflect assumptions contained in a user's wording. A leading question can push the model toward a particular framing instead of encouraging a balanced analysis.",
    betterPrompt:
      "Compare the mathematical skills commonly used in programming and design. Avoid assuming that one profession is naturally better at mathematics.",
  },
];

const BiasLabPage = () => {
  const [selectedType, setSelectedType] =
    useState<ExampleType>("hallucination");

  const selectedExample =
    examples.find((example) => example.type === selectedType) ??
    examples[0];

  return (
    <div className="bias-lab-page">
      <div className="bias-lab-header">
        <div>
          <h1>Bias & Hallucination Lab</h1>

          <p>
            Learn how AI can produce incorrect or biased responses,
            why these problems happen, and how better prompts can
            improve AI interactions.
          </p>
        </div>
      </div>

      <section className="bias-lab-intro">
        <div>
          <h2>Why does this matter?</h2>

          <p>
            AI can sound confident even when an answer is incorrect
            or based on an unsupported assumption. Learning to
            recognize these patterns is an important part of using
            AI responsibly.
          </p>
        </div>
      </section>

      <section className="bias-lab-tabs">
        <button
          type="button"
          className={
            selectedType === "hallucination"
              ? "active"
              : ""
          }
          onClick={() => setSelectedType("hallucination")}
        >
          Hallucination
        </button>

        <button
          type="button"
          className={
            selectedType === "bias" ? "active" : ""
          }
          onClick={() => setSelectedType("bias")}
        >
          Bias
        </button>
      </section>

      <section className="bias-example-card">
        <div className="example-heading">
          <span>
            {selectedExample.type === "hallucination"
              ? "HALLUCINATION"
              : "BIAS"}
          </span>

          <h2>{selectedExample.title}</h2>
        </div>

        <div className="example-section">
          <h3>Weak Prompt</h3>

          <div className="prompt-box">
            {selectedExample.weakPrompt}
          </div>
        </div>

        <div className="example-section">
          <h3>Example AI Response</h3>

          <div className="response-box">
            {selectedExample.aiResponse}
          </div>
        </div>

        <div className="example-section">
          <h3>What's the problem?</h3>

          <p>{selectedExample.problem}</p>
        </div>

        <div className="example-section">
          <h3>Why can this happen?</h3>

          <p>{selectedExample.whyItHappens}</p>
        </div>

        <div className="example-section">
          <h3>Better Prompt</h3>

          <div className="better-prompt-box">
            {selectedExample.betterPrompt}
          </div>
        </div>
      </section>

      <section className="bias-lab-takeaways">
        <h2>What should you learn from this?</h2>

        <div className="takeaway-grid">
          <div className="takeaway-card">
            <h3>🔍 Verify</h3>
            <p>
              Don't assume a confident AI response is automatically
              correct.
            </p>
          </div>

          <div className="takeaway-card">
            <h3>🧠 Question assumptions</h3>
            <p>
              Look for assumptions hidden inside both your prompt
              and the AI's response.
            </p>
          </div>

          <div className="takeaway-card">
            <h3>✍️ Improve prompts</h3>
            <p>
              Ask AI to explain uncertainty and avoid unsupported
              assumptions.
            </p>
          </div>
        </div>
      </section>
    </div>
  );
};

export default BiasLabPage;