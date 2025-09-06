import axios from 'axios';

// ✨ Function 1: Analyze user's journal entry
export const analyzeJournal = async (entryText) => {
  const prompt = `
You are a kind and supportive mental health assistant.

Analyze the following journal entry and respond in this JSON format:
{
  "mood": "<1-2 word mood>",
  "emoji": "<1 emoji representing mood>",
  "feedback": "<short motivational feedback>",
  "prompt": "<journaling prompt for next time>"
}

Journal Entry:
"""
${entryText}
"""
`;

  try {
    const res = await axios.post(
      'https://generativelanguage.googleapis.com/v1beta/models/gemini-2.5-flash:generateContent',
      {
        contents: [
          {
            role: 'user',
            parts: [{ text: prompt }],
          },
        ],
      },
      {
        headers: {
          'Content-Type': 'application/json',
          'x-goog-api-key': import.meta.env.VITE_GEMINI_API_KEY,
        },
      }
    );

    const raw = res.data.candidates?.[0]?.content?.parts?.[0]?.text;
    const match = raw.match(/\{[\s\S]*\}/); // extract JSON block

    if (!match) throw new Error("Failed to extract JSON");

    return JSON.parse(match[0]);

  } catch (err) {
    console.error("Gemini API Error (analyzeJournal):", err.message);
    return {
      mood: "unknown",
      emoji: "❓",
      feedback: "We couldn’t analyze your journal today.",
      prompt: "How are you feeling right now?",
    };
  }
};

// ✨ Function 2: Fetch a motivational quote for landing page
export const getDailyQuote = async () => {
  const quotePrompt = `
You're a calm, kind, and gentle journaling assistant.

Generate a short motivational quote or reflection about journaling or mental health — no longer than 20 words. No quotation marks.

Examples:
- Writing is how the soul breathes.
- One word at a time heals the mind.
- Your journal is your sanctuary — your truth lives here.

Now generate one fresh quote:
`;

  try {
    const res = await axios.post(
      'https://generativelanguage.googleapis.com/v1beta/models/gemini-2.5-flash:generateContent',
      {
        contents: [
          {
            role: 'user',
            parts: [{ text: quotePrompt }],
          },
        ],
      },
      {
        headers: {
          'Content-Type': 'application/json',
          'x-goog-api-key': import.meta.env.VITE_GEMINI_API_KEY,
        },
      }
    );

    const quote = res.data.candidates?.[0]?.content?.parts?.[0]?.text;
    return quote || "Write with honesty, heal with intention.";
  } catch (err) {
    console.error("Gemini API Error (getDailyQuote):", err.message);
    return "Write with honesty, heal with intention.";
  }
};