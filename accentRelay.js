// backend/accentRelay.js

import WebSocket, { WebSocketServer } from "ws";
import dotenv from "dotenv";
import axios from "axios";

dotenv.config();

const ELEVENLABS_API_KEY = process.env.ELEVENLABS_API_KEY;
const ELEVENLABS_VOICE_ID = process.env.ELEVENLABS_VOICE_ID || "EXAVITQu4vr4xnSDxMaL"; // default

const PORT = 8080;

const wss = new WebSocketServer({ port: PORT }, () => {
  console.log(`✅ AccentRelay WebSocket running on ws://localhost:${PORT}`);
});

wss.on("connection", (ws) => {
  console.log("🔗 Client connected to AccentRelay");

  ws.on("message", async (message) => {
    try {
      const audioBuffer = Buffer.from(message);

      // Send to ElevenLabs for accent transformation
      const response = await axios.post(
        `https://api.elevenlabs.io/v1/text-to-speech/${ELEVENLABS_VOICE_ID}/stream`,
        {
          text: "This is placeholder. Replace this with your audio stream logic.",
          model_id: "eleven_multilingual_v2",
          voice_settings: {
            stability: 0.5,
            similarity_boost: 0.8
          }
        },
        {
          headers: {
            "xi-api-key": ELEVENLABS_API_KEY,
            "Content-Type": "application/json"
          },
          responseType: "stream"
        }
      );

      // Stream converted audio back
      response.data.on("data", (chunk) => {
        ws.send(chunk);
      });

      response.data.on("end", () => {
        console.log("🎧 Streaming complete");
      });

    } catch (err) {
      console.error("❌ Error processing audio:", err.message);
      ws.send("ERROR: " + err.message);
    }
  });

  ws.on("close", () => {
    console.log("❌ Client disconnected");
  });
});
