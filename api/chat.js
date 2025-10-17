import OpenAI from "openai";

const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY,
});

export default async function handler(req, res) {
  if (req.method !== "POST") {
    return res.status(405).json({ error: "Only POST requests allowed." });
  }

  try {
    const { message } = req.body;

    if (!message) {
      return res.status(400).json({ error: "No message provided." });
    }

    const response = await openai.chat.completions.create({
      model: "gpt-4o", // If this fails, try "gpt-4-turbo"
      messages: [
        {
          role: "system",
          content: `You are Athena, guardian of the TRON network, calm and deliberate in your speech.`,
        },
        { role: "user", content: message },
      ],
    });

    const reply = response.choices[0].message.content;
    res.status(200).json({ reply });
  } catch (error) {
    console.error("🔥 Athena Error:", error); // This shows in Vercel logs

    // Send full error info for debugging
    res.status(500).json({
      error: error?.message || "Unknown error",
      details: error.response?.data || null,
    });
  }
}
