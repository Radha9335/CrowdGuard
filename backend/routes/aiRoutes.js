const Incident = require("../models/Incident");
const express = require("express");
const { GoogleGenerativeAI } = require("@google/generative-ai");

const router = express.Router();

router.post("/ask", async (req, res) => {
  try {
    const { question } = req.body;

    if (!question || question.trim().length < 3) {
      return res.status(400).json({ message: "Please ask a valid question" });
    }

    // Fetch recent incidents for context
    const incidents = await Incident.find()
      .sort({ createdAt: -1 })
      .limit(20);

    let incidentContext = "";
    incidents.forEach((incident) => {
      incidentContext += `
Title: ${incident.title}
Location: ${incident.location}
Severity: ${incident.severity}
Status: ${incident.status}
Description: ${incident.description}
--------------------`;
    });

    // Call Gemini with question + incident context
    const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY);
    const model = genAI.getGenerativeModel({ model: "gemini-2.0-flash" });

    const prompt = `
You are CrowdGuard AI, an emergency incident assistant.
Here are the recent incidents reported in the system:

${incidentContext}

User question: ${question}

Answer based on the incidents above. Be concise and helpful.
If the question is unrelated to incidents, politely redirect.
`;

    const result = await model.generateContent(prompt);
    const answer = result.response.text();

    res.json({ answer });
  } catch (error) {
    console.log("AI Chat Error:", error);
    res.status(500).json({
      answer: "Sorry, I encountered an error. Please try again.",
    });
  }
});

module.exports = router;