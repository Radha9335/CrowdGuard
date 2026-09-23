const OpenAI = require("openai");

const client = new OpenAI({
  apiKey: process.env.OPENROUTER_API_KEY,
  baseURL: "https://openrouter.ai/api/v1",
});

const MODELS = [
  "nex-agi/nex-n2.5-mini:free",
  "liquid/lfm-2.5-2.6b:free",
  "qwen/qwen3.8-27b:free",
];

const analyzeIncident = async (title, description, location) => {
  const prompt = `
You are an AI Emergency Response System.

Incident Title:
${title}

Description:
${description}

Location:
${location}

Return ONLY in this format:

CATEGORY: <category>

SEVERITY: <Low/Medium/High>

EMERGENCY_LEVEL: <Normal/Warning/Critical>

PRIORITY: <Low/Medium/Immediate>

ACTIONS:
- action 1
- action 2
- action 3

Keep it concise.
`;

  for (const model of MODELS) {
    try {
      const completion = await client.chat.completions.create({
        model,
        messages: [
          {
            role: "system",
            content: "You are an emergency incident analyst.",
          },
          {
            role: "user",
            content: prompt,
          },
        ],
      });

      const aiResponse = completion.choices[0].message.content;
      if (aiResponse) return aiResponse;
    } catch (err) {
      console.log(`OpenRouter model ${model} failed:`, err.message);
    }
  }

  // Fallback response if all AI models fail
  return `
CATEGORY: General Incident

SEVERITY: Medium

EMERGENCY_LEVEL: Warning

PRIORITY: Medium

ACTIONS:
- Review incident details manually
- Notify local emergency response team if urgent
- Verify location and report status
`;
};

module.exports = {
  analyzeIncident,
};