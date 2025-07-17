const express = require("express");
const bodyParser = require("body-parser");
const { twiml: { VoiceResponse } } = require("twilio");
const axios = require("axios");

const app = express();
app.use(bodyParser.urlencoded({ extended: false }));

const PORT = process.env.PORT || 3000;

const ELEVEN_API_KEY = process.env.sk_ae509d624141ec779d6b2e91a11447320d55410a8fdf0d07 || "";
const AGENT_ID = process.env.agent_01jz06gxzcf7xbmkn0pm20mha9 || "";

// Endpoint Twilio când vine un apel
app.post("/voice", (req, res) => {
  const response = new VoiceResponse();

  response.say("Conectez cu agentul AI. Vă rugăm să începeți să vorbiți.");

  response.start().stream({
    url: `${req.protocol}://${req.get("host")}/stream`
  });

  res.type("text/xml");
  res.send(response.toString());
});

// Endpoint care primește stream audio Twilio
app.post("/stream", async (req, res) => {
  // Deocamdată doar confirmăm primirea stream-ului
  // Aici va trebui să adaugi logica pentru a transmite audio la ElevenLabs și a primi răspunsul

  res.sendStatus(200);
});

// Health check simplu
app.get("/", (req, res) => {
  res.send("✅ Twilio → ElevenLabs server live");
});

app.listen(PORT, () => {
  console.log(`🚀 Serverul rulează pe portul ${PORT}`);
});
