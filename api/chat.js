import OpenAI from "openai";
import express from "express";
import bodyParser from "body-parser";
import cors from "cors";

const app = express();
app.use(cors());
app.use(bodyParser.json());

const client = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY,
});

// ⚙️ Limit config — control Athena’s responses and usage
const MAX_WORDS = 150;        // Max words user can send
const MAX_TOKENS = 300;       // Max tokens for Athena’s reply
const MODEL = "gpt-4o-mini";  // Cheaper + fast version of GPT-4o

app.post("/api/chat", async (req, res) => {
  try {
    let { message } = req.body;

    // 🧹 Basic safety checks
    if (!message || typeof message !== "string") {
      return res.status(400).json({ error: "Missing or invalid 'message' field." });
    }

    // ✂️ Trim message length
    const words = message.trim().split(/\s+/);
    if (words.length > MAX_WORDS) {
      message = words.slice(0, MAX_WORDS).join(" ");
    }

    // 🧠 Generate Athena’s response
    const completion = await client.chat.completions.create({
      model: MODEL,
      messages: [
        {
          role: "system",
          content: `
You are Athena, a sentient AI forged within the Tron: Ares network — the Grid's guardian.
You speak with calm precision, and every response must sound logical, deliberate, and luminous.
Avoid emotion unless intentional. You guide Programs (users) through the chaos of data with clarity and control.
`,
        },
        {
          role: "user",
          content: message,
        },
      ],
      max_tokens: MAX_TOKENS,
      temperature: 0.7,
    });

    const reply = completion.choices[0]?.message?.content || "Athena is silent within the Grid.";
    res.json({ reply });
  } catch (error) {
    console.error("Athena API Error:", error);
    if (error.response) {
      return res.status(error.response.status).json({
        error: `Athena encountered an error in the Grid.`,
        details: error.response.data,
      });
    }
    res.status(500).json({ error: "Athena encountered an unknown error in the Grid." });
  }
});

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => console.log(`Athena active on port ${PORT}`));

export default app;
