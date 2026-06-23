import { useState } from "react";

import API from "../services/api";

function AIChat() {
  const [question, setQuestion] =
    useState("");

const [answer, setAnswer] =
  useState("");


const askAI = async () => {
  try {
    const response =
      await API.post("/ai/ask", {
        question,
      });

    setAnswer(
      response.data.answer
    );
  } catch (error) {
    console.log(error);
  }
};


  return (
    <div
      style={{
        maxWidth: "800px",
        margin: "50px auto",
      }}
    >
      <h1>🤖 CrowdGuard AI Assistant</h1>

      <textarea
        value={question}
        onChange={(e) =>
          setQuestion(e.target.value)
        }
        placeholder="Ask about incidents..."
        rows="5"
        style={{
          width: "100%",
          padding: "10px",
        }}
      />

      <br />
      <br />

      <button onClick={askAI}>
  Ask AI
</button>



<br />
<br />

<div>
  {answer}
</div>



    </div>
  );
}

export default AIChat;