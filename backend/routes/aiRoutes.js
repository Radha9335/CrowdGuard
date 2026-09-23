const Incident = require("../models/Incident");
const express = require("express");
const { GoogleGenerativeAI } = require("@google/generative-ai");
const OpenAI = require("openai");

const router = express.Router();

const getOpenAIClient = () => {
  return new OpenAI({
    apiKey: process.env.OPENROUTER_API_KEY || "dummy_key",
    baseURL: "https://openrouter.ai/api/v1",
  });
};

const OPENROUTER_MODELS = [
  "nex-agi/nex-n2.5-mini:free",
  "liquid/lfm-2.5-2.6b:free",
  "qwen/qwen3.8-27b:free",
];

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

    const prompt = `
You are CrowdGuard AI, an emergency incident assistant.
Here are the recent incidents reported in the system:

${incidentContext}

User question: ${question}

Answer based on the incidents above. Be concise and helpful.
If the question is unrelated to incidents, politely redirect.
`;

    // Try Gemini AI first
    try {
      const apiKey = process.env.GEMINI_API_KEY || "dummy_key";
      const genAI = new GoogleGenerativeAI(apiKey);
      const model = genAI.getGenerativeModel({ model: "gemini-3.6-flash" });
      const result = await model.generateContent(prompt);
      const answer = result.response.text();
      return res.json({ answer });
    } catch (geminiError) {
      console.log("Gemini failed, trying OpenRouter fallback:", geminiError.message);
    }

    // Fallback to OpenRouter
    for (const model of OPENROUTER_MODELS) {
      try {
        const client = getOpenAIClient();
        const completion = await client.chat.completions.create({
          model,
          messages: [{ role: "user", content: prompt }],
        });
        const answer = completion.choices[0]?.message?.content;
        if (answer) {
          return res.json({ answer });
        }
      } catch (openRouterErr) {
        console.log(`OpenRouter model ${model} failed:`, openRouterErr.message);
      }
    }

    res.json({
      answer: "I am unable to reach the AI models right now. Please check reported incidents directly on your dashboard.",
    });
  } catch (error) {
    console.log("AI Chat Error:", error);
    res.status(500).json({
      answer: "Sorry, I encountered an error. Please try again.",
    });
  }
});

module.exports = router;