const { GoogleGenerativeAI } = require("@google/generative-ai");

const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY);

const model = genAI.getGenerativeModel({ model: "gemini-2.0-flash" });

const analyzeIncident = async (title, description, location) => {
  try {
    const prompt = `
You are an emergency incident analyst.

Incident Title:
${title}

Description:
${description}

Location:
${location}

Analyze this incident and provide:

1. Incident Category
2. Severity Score (1-10)
3. Recommended Action
4. Is this a likely emergency? (Yes/No)

Keep answer short.
`;

    const result = await model.generateContent(prompt);

    return result.response.text();

  } catch (error) {
    console.log("GEMINI ERROR:");
    console.log(error);

    return `
Incident Category: Unknown

Severity Score: 5

Recommended Action:
Please review this incident manually.

Likely Emergency: Unknown
`;
  }
};

module.exports = { analyzeIncident };