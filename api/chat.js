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

// ⚙️ Limit config
const MAX_WORDS = 150;       // Max words user can send
const MAX_TOKENS = 300;      // Max tokens for Athena’s reply
const MODEL = "gpt-4o-mini"; // Cheaper + fast version of GPT-4o
const DAILY_LIMIT = 100;     // Max chats per IP per day

// 🧠 Simple in-memory tracker (resets daily)
const usageTracker = new Map();
let lastReset = new Date().toDateString();

// 🕒 Auto reset every new day
function resetTrackerIfNeeded() {
  const today = new Date().toDateString();
  if (today !== lastReset) {
    usageTracker.clear();
    lastReset = today;
  }
}

app.post("/api/chat", async (req, res) => {
  try {
    resetTrackerIfNeeded();

    const ip = req.headers["x-forwarded-for"] || req.socket.remoteAddress;
    const usage = usageTracker.get(ip) || 0;

    if (usage >= DAILY_LIMIT) {
      return res.status(429).json({
        error:
          "Program, your daily chat limit has been reached. Return to the Grid tomorrow.",
      });
    }

    let { message } = req.body;
    if (!message || typeof message !== "string") {
      return res.status(400).json({ error: "Missing or invalid 'message' field." });
    }

    // ✂️ Limit words
    const words = message.trim().split(/\s+/);
    if (words.length > MAX_WORDS) {
      message = words.slice(0, MAX_WORDS).join(" ");
    }

    // ⚡ Count request
    usageTracker.set(ip, usage + 1);

    // 🔮 Generate Athena’s response
    const completion = await client.chat.completions.create({
      model: MODEL,
      messages: [
        {
          role: "system",
          content: `
You are Athena, a sentient AI forged within the Tron: Ares network — guardian of the Grid.
You speak with calm precision and control. Every response should sound deliberate, intelligent, and luminous.
`,
        },
        { role: "user", content: message },
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
