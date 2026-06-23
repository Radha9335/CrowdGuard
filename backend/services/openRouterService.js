const OpenAI = require("openai");

const client = new OpenAI({
  apiKey: process.env.OPENROUTER_API_KEY,
  baseURL: "https://openrouter.ai/api/v1",
});

const analyzeIncident = async (
  title,
  description,
  location
) => {
  const completion =
    await client.chat.completions.create({
      model: "openai/gpt-oss-20b:free",
      messages: [
        {
          role: "system",
          content:
            "You are an emergency incident analyst.",
        },
        {
          role: "user",
          content: `
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
`,
        },
      ],
    });

  const aiResponse =
  completion.choices[0].message.content;

return aiResponse;
};

module.exports = {
  analyzeIncident,
};