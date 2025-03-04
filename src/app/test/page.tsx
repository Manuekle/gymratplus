// app/page.tsx
"use client"; // Marca como componente del lado del cliente

import { useState } from "react";

export default function TextClassifier() {
  const [text, setText] = useState("hola");
  const [label, setLabel] = useState("");
  const [score, setScore] = useState(0);

  const classifyText = async () => {
    const response = await fetch("/api/classify", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({ text }),
    });

    const data = await response.json();

    if (response.ok) {
      setLabel(data.label);
      setScore(data.score);
    } else {
      console.error(data.error);
      setLabel("Error");
      setScore(0);
    }
  };

  return (
    <div>
      <input
        type="text"
        value={text}
        onChange={(e) => setText(e.target.value)}
      />
      <button onClick={classifyText}>Classify</button>
      {label && (
        <div>
          Label: {label}, Score: {score}
        </div>
      )}
    </div>
  );
}
