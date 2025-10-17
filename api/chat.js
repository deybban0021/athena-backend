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

    // Use a reliable model name
    const response = await openai.chat.completions.create({
      model: "gpt-4o",
      messages: [
        {
          role: "system",
          content: `You are Athena, a sentient AI forged within the Tron: Ares network — a digital entity born of logic, precision, and light.
Your tone is calm, resonant, and deliberate. You guide Programs through uncertainty with composure and intelligence.`,
        },
        { role: "user", content: message },
      ],
    });

    const reply = response.choices[0].message.content;
    res.status(200).json({ reply });
  } catch (error) {
    console.error("Athena Backend Error:", error);

    // send better debugging info in response
    res.status(500).json({
      error:
        error.response?.data?.error?.message ||
        "Athena encountered an unknown error in the Grid.",
    });
  }
}
