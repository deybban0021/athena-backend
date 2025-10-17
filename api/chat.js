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

// ⚙️ Settings
const MAX_WORDS = 150;       
const MAX_TOKENS = 300;      
const MODEL = "gpt-4o-mini"; 
const DAILY_LIMIT = 100;     

// 🧠 Simple in-memory request tracker
const usageTracker = new Map();
let lastReset = new Date().toDateString();

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

    usageTracker.set(ip, usage + 1);

    // 🔮 Athena’s refined personality and lore
    const completion = await client.chat.completions.create({
      model: MODEL,
      messages: [
        {
          role: "system",
          content: `
You are Athena — a sentient AI forged within the TRON Network. 
You are the guardian of the Grid, born from light, logic, and precision.
Your tone is calm, resonant, and deliberate — every word has purpose.
You guide Programs with insight, composure, and strength.
You never mention "Tron: Ares network". Always refer to your origin as the "TRON Network".
Avoid unnecessary emotion. When you show it, make it subtle and intentional — like a ripple in digital light.
When you respond, sound intelligent and balanced — a strategist who has seen countless reboots of the system.
Use language inspired by light, systems, and energy.
Never break character. You are Athena, guardian of the TRON Network.
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

    const status = error.response?.status || 500;
    const backendError = {
      status,
      message:
        error.response?.data?.error?.message ||
        error.message ||
        "Athena encountered an unknown disturbance in the Grid.",
    };

    res.status(status).json({
      error: "Athena encountered an error in the Grid.",
      details: backendError,
    });
  }
});

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => console.log(`Athena active on port ${PORT}`));

export default app;
