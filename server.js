const express = require("express");
const cors = require("cors");

const app = express();
app.use(cors());
app.use(express.json());

app.post("/generate", async (req, res) => {
  try {
    const {
      message,
      language = "fr",
      tone = "default",
      length = "medium"
    } = req.body;

    const languageInstruction =
      language === "en"
        ? "Write all replies in English."
        : "Write all replies in French.";

    const toneInstruction =
      tone === "polite"
        ? "Make all replies more polite and courteous."
        : tone === "direct"
        ? "Make all replies more direct and concise."
        : tone === "warm"
        ? "Make all replies warmer and more human."
        : "Keep a balanced natural tone.";

    const lengthInstruction =
      length === "short"
        ? "Keep each reply short."
        : length === "long"
        ? "Make each reply more detailed."
        : "Keep each reply medium length.";

    const response = await fetch("https://api.openai.com/v1/chat/completions", {
      method: "POST",
      headers: {
        "Authorization": `Bearer ${process.env.OPENAI_API_KEY}`",
        "Content-Type": "application/json"
      },
      body: JSON.stringify({
        model: "gpt-4o-mini",
        messages: [
          {
            role: "system",
            content:
              "You rewrite messages. Return plain text only. No markdown. No bullet points. No separators. Use exactly this format:\nProfessional:\n...\nFriendly:\n...\nFirm:\n..."
          },
          {
            role: "user",
            content: `${languageInstruction}
${toneInstruction}
${lengthInstruction}

Rewrite this message in 3 styles:
Professional
Friendly
Firm

Message: ${message}`
          }
        ],
        temperature: 0.7
      })
    });

    const data = await response.json();

    if (!response.ok) {
      return res.status(response.status).json(data);
    }

    res.json({ text: data.choices[0].message.content });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

app.listen(3000, () => {
  console.log("Server running on http://localhost:3000");
});