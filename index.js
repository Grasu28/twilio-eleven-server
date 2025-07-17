// ✅ Twilio + ElevenLabs AI Voice Streaming Server

const express = require("express");
const bodyParser = require("body-parser");
const WebSocket = require("ws");
const axios = require("axios");
const { twiml } = require("twilio");

const app = express();
app.use(bodyParser.urlencoded({ extended: false }));

const PORT = process.env.PORT || 3000;

// 🧠 ElevenLabs
const ELEVEN_API_KEY = "sk_ae509d624141ec779d6b2e91a11447320d55410a8fdf0d07";
const AGENT_ID = "agent_01jz06gxzcf7xbmkn0pm20mha9";

// 🎧 Twilio Voice Webhook
app.post("/voice", (req, res) => {
  const response = new twiml.VoiceResponse();
  response.say("Conectez cu agentul AI. Va rugam asteptati.");

  response.connect().stream({
    url: `wss://${req.hostname}/twilio-stream`,
    track: "both_tracks",
  });

  res.type("text/xml");
  res.send(response.toString());
});

// 🌐 WebSocket Server for Twilio stream
const server = app.listen(PORT, () => {
  console.log(`🚀 Server pornit pe portul ${PORT}`);
});

const wss = new WebSocket.Server({ server, path: "/twilio-stream" });

wss.on("connection", async (twilioSocket) => {
  console.log("📞 Conexiune Twilio WS deschisa");

  const elevenSocket = new WebSocket(
    `wss://api.elevenlabs.io/v1/agents/${AGENT_ID}/stream`,
    [],
    {
      headers: {
        "xi-api-key": ELEVEN_API_KEY,
      },
    }
  );

  elevenSocket.on("open", () => {
    console.log("🤖 Conectat la ElevenLabs WS");
  });

  elevenSocket.on("message", (data) => {
    const parsed = JSON.parse(data);
    if (parsed.audio) {
      // Trimite audio generat de ElevenLabs inapoi la Twilio
      const message = JSON.stringify({
        event: "media",
        media: {
          payload: parsed.audio,
        },
      });
      twilioSocket.send(message);
    }
  });

  twilioSocket.on("message", (data) => {
    const msg = JSON.parse(data);
    if (msg.event === "media" && msg.media && msg.media.payload) {
      // Trimite audio de la Twilio catre ElevenLabs
      const audioMessage = JSON.stringify({
        audio: msg.media.payload,
      });
      if (elevenSocket.readyState === WebSocket.OPEN) {
        elevenSocket.send(audioMessage);
      }
    }
  });

  twilioSocket.on("close", () => {
    console.log("📴 Twilio WS inchis");
    if (elevenSocket.readyState === WebSocket.OPEN) {
      elevenSocket.close();
    }
  });

  elevenSocket.on("close", () => {
    console.log("📴 ElevenLabs WS inchis");
    if (twilioSocket.readyState === WebSocket.OPEN) {
      twilioSocket.close();
    }
  });

  twilioSocket.on("error", (err) => console.error("Eroare Twilio WS:", err));
  elevenSocket.on("error", (err) => console.error("Eroare ElevenLabs WS:", err));
});

// Health check
app.get("/", (req, res) => {
  res.send("✅ Server Twilio ↔ ElevenLabs activ");
});
