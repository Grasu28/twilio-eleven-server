const express = require("express");
const bodyParser = require("body-parser");
const { twiml } = require("twilio");
const axios = require("axios");

const app = express();
app.use(bodyParser.urlencoded({ extended: false }));

const PORT = process.env.PORT || 3000;

// 🔧 Configurare ElevenLabs
const ELEVEN_API_KEY = "sk_ae509d624141ec779d6b2e91a11447320d55410a8fdf0d07";
const AGENT_ID = "agent_01jz06gxzcf7xbmkn0pm20mha9";

// Twilio trimite POST când vine un apel
app.post("/voice", async (req, res) => {
  const response = new twiml.VoiceResponse();

  // Trimite mesajul inițial în timp real
  response.say("Conectez cu agentul AI. Vă rugăm să începeți să vorbiți.");

  // Redirectează stream-ul audio către serverul tău
  response.connect().stream({
    url: `${req.protocol}://${req.get("host")}/stream`,
    track: "both_tracks",
  });

  res.type("text/xml");
  res.send(response.toString());
});

// Twilio transmite audio în timp real aici
app.post("/stream", async (req, res) => {
  // Într-un caz real, aici ai prelucra audio-ul și îl trimiți la ElevenLabs

  // Demo de trimitere prompt text către agentul ElevenLabs
  const message = {
    agent_id: AGENT_ID,
    voice: "default",
    text_input: "Salut! Cu ce te pot ajuta?",
  };

  try {
    const aiResponse = await axios.post(
      "https://api.elevenlabs.io/v1/agents/stream",
      message,
      {
        headers: {
          "xi-api-key": ELEVEN_API_KEY,
          "Content-Type": "application/json",
        },
        responseType: "stream",
      }
    );

    // TODO: trimite streamul audio înapoi către Twilio
    // În varianta completă, streamul audio de la ElevenLabs e redat în apel

    res.sendStatus(200);
  } catch (err) {
    console.error("Eroare ElevenLabs:", err.message);
    res.sendStatus(500);
  }
});

// Health check
app.get("/", (req, res) => {
  res.send("✅ Twilio → ElevenLabs server live");
});

app.listen(PORT, () => {
  console.log(`🚀 Serverul rulează pe portul ${PORT}`);
});
