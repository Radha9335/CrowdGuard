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
Incident Title:
${title}

Description:
${description}

Location:
${location}

Analyze this incident.

Return EXACTLY in this format:

SEVERITY: Low

or

SEVERITY: Medium

or

SEVERITY: High

Then write:

ANALYSIS:
<your analysis>

Rules:

- Fire, violence, medical emergency, trapped people = High
- Traffic accident with injuries = Medium
- Minor issues = Low
- Keep analysis under 100 words.
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