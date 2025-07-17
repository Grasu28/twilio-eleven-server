const WebSocket = require('ws');
const http = require('http');
const express = require('express');

const app = express();
const server = http.createServer(app);
const wss = new WebSocket.Server({ server });

console.log("🟢 Server WebSocket pornit...");

wss.on('connection', (ws, req) => {
  console.log('✅ Twilio s-a conectat la WebSocket');

  ws.on('message', async (msg) => {
    const data = JSON.parse(msg);
    
    if (data.event === 'start') {
      console.log('📞 Apel pornit de la:', data.start.callSid);
    }

    if (data.event === 'media') {
      const audioPayload = data.media.payload; // base64 audio

      // TODO: Trimite audio-ul către ElevenLabs Agent (stream)
      // TODO: Primește răspuns audio și redă către Twilio

      // În acest demo doar logăm
      console.log('🎧 Primit audio:', audioPayload.slice(0, 20), '...');
    }

    if (data.event === 'stop') {
      console.log('📴 Apel terminat');
    }
  });

  ws.on('close', () => {
    console.log('❌ Conexiune Twilio închisă');
  });
});

app.get('/', (req, res) => {
  res.send('✅ Twilio → ElevenLabs server live');
});

const PORT = process.env.PORT || 3000;
server.listen(PORT, () => {
  console.log(`🚀 Server ascultă pe portul ${PORT}`);
});
