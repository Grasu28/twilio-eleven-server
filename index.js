const express = require("express");
const bodyParser = require("body-parser");
const { twiml } = require("twilio");
const axios = require("axios");
const http = require("http");
const WebSocket = require("ws");

const app = express();
const server = http.createServer(app);
const wss = new WebSocket.Server({ noServer: true });

app.use(bodyParser.urlencoded({ extended: false }));

const PORT = process.env.PORT || 3000;

const ELEVEN_API_KEY = "PUNE_CHEIA_TA";
const AGENT_ID = "PUNE_AGENT_ID_TAU";

// Ruta Twilio voice
app.post("/voice", (req, res) => {
  const response = new twiml.VoiceResponse();
  response.say("Conectez cu agentul AI. Vă rugăm așteptați.");

  response.connect().stream({
    url: `wss://${req.get("host")}/stream`,
    track: "both_tracks",
  });

  res.type("text/xml");
  res.send(response.toString());
});

// WebSocket upgrade handler
server.on("upgrade", (req, socket, head) => {
  wss.handleUpgrade(req, socket, head, (ws) => {
    console.log("✅ WebSocket conectat de la Twilio");

    ws.on("message", async (data) => {
      // aici ai primi datele audio în format base64 sau binary
      console.log("📥 Primit audio frame");

      // Exemplu: trimiți text de test agentului
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

        // Într-o versiune completă: stream-ul audio de aici se redă în apel
        console.log("🧠 Răspuns de la agent primit");
      } catch (err) {
        console.error("❌ Eroare ElevenLabs:", err.message);
      }
    });

    ws.on("close", () => {
      console.log("🔌 WebSocket închis");
    });
  });
});

// Test route
app.get("/", (req, res) => {
  res.send("✅ Serverul Twilio-ElevenLabs este live");
});

server.listen(PORT, () => {
  console.log(`🚀 Serverul rulează pe portul ${PORT}`);
});
