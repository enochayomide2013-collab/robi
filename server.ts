/**
 * ACADO Express Backend Server
 */

import express from 'express';
import path from 'path';
import { createServer as createViteServer } from 'vite';
import { GoogleGenAI, Type } from '@google/genai';

const app = express();
const PORT = 3000;

app.use(express.json());

// Initialize Gemini API client on server-side only
const ai = new GoogleGenAI({
  apiKey: process.env.GEMINI_API_KEY || '',
  httpOptions: {
    headers: {
      'User-Agent': 'aistudio-build',
    },
  },
});

// ==========================================
// API ROUTES
// ==========================================

app.get('/api/health', (req, res) => {
  res.json({ status: 'ok', server: 'ACADO Core Universe Engine', version: '1.0.0' });
});

// AI WORLD BUILDER ENDPOINT
app.post('/api/ai/build-world', async (req, res) => {
  try {
    const { prompt } = req.body;
    if (!prompt) {
      return res.status(400).json({ error: 'Prompt is required' });
    }

    const response = await ai.models.generateContent({
      model: 'gemini-3.8-flash',
      contents: `You are the ACADO AI 3D World Architect. Convert the user's game request into a valid JSON 3D World definition for ACADO Studio.

User Prompt: "${prompt}"

Generate a JSON object conforming strictly to this structure:
{
  "skyColor": "#0a0a23" (hex color),
  "timeOfDay": "day" | "sunset" | "night" | "cyberpunk",
  "weather": "clear" | "rain" | "snow" | "fog",
  "gravity": 9.8,
  "spawnPoint": [0, 1, 0],
  "objects": [
    {
      "id": "string",
      "name": "string",
      "type": "block" | "sphere" | "cylinder" | "building" | "road" | "tree" | "car" | "npc" | "light" | "coin" | "checkpoint" | "finish_line" | "water" | "ramp" | "goal_post" | "lava_hazard",
      "position": [x, y, z],
      "rotation": [0, 0, 0],
      "scale": [sx, sy, sz],
      "color": "hex_color",
      "material": "smooth" | "brick" | "neon" | "metal" | "wood",
      "behavior": "static" | "moving" | "spinning" | "vehicle" | "npc_dialogue" | "hazard" | "collectible"
    }
  ],
  "npcs": [
    {
      "id": "string",
      "name": "string",
      "role": "shopkeeper" | "quest_giver" | "guide" | "citizen",
      "position": [x, y, z],
      "dialogue": ["Greeting 1", "Greeting 2"]
    }
  ],
  "quests": [
    {
      "id": "string",
      "title": "string",
      "description": "string",
      "rewardCoins": 50,
      "rewardXp": 100
    }
  ]
}

Include 6 to 12 realistic 3D objects arranged thoughtfully in 3D space with reasonable scale and coordinate positions.`,
      config: {
        responseMimeType: 'application/json',
      },
    });

    const jsonText = response.text || '{}';
    const parsedWorld = JSON.parse(jsonText);
    res.json({ success: true, worldData: parsedWorld });
  } catch (error: any) {
    console.error('AI World Builder error:', error);
    res.status(500).json({ error: 'Failed to generate 3D world', details: error?.message });
  }
});

// AI NPC DIALOGUE ENDPOINT
app.post('/api/ai/npc-chat', async (req, res) => {
  try {
    const { npcName, npcRole, userMessage, worldContext } = req.body;

    const response = await ai.models.generateContent({
      model: 'gemini-3.8-flash',
      contents: `You are playing the role of an NPC named "${npcName}" (Role: ${npcRole}) inside the ACADO 3D world "${worldContext || 'ACADO World'}".
Rules:
- Keep responses playful, concise (1-3 short sentences), family-friendly, and in-character.
- Never reveal private personal info or break the game universe immersion.

User says: "${userMessage}"`,
    });

    res.json({ responseText: response.text?.trim() || "Hello explorer! Welcome to ACADO!" });
  } catch (error: any) {
    res.status(500).json({ error: 'NPC dialogue error', responseText: 'Greetings adventurer!' });
  }
});

// AI SCRIPTING ASSISTANT
app.post('/api/ai/script-assistant', async (req, res) => {
  try {
    const { code, instruction } = req.body;

    const response = await ai.models.generateContent({
      model: 'gemini-3.8-flash',
      contents: `You are the ACADO Studio Lua Scripting Assistant.
Instruction: "${instruction}"
Current Code:
\`\`\`lua
${code || '-- New script'}
\`\`\`

Generate clean, well-commented Lua-style code for ACADO Studio event triggers, coins, doors, or vehicle mechanics. Return only the code inside code blocks and a brief explanation.`,
    });

    res.json({ explanation: response.text || 'Script generated successfully.' });
  } catch (error: any) {
    res.status(500).json({ error: 'Script assistant failed' });
  }
});

// CONTENT MODERATION CHECK
app.post('/api/ai/moderate-content', async (req, res) => {
  try {
    const { text } = req.body;
    const response = await ai.models.generateContent({
      model: 'gemini-3.8-flash',
      contents: `Analyze this chat or text for severe toxicity, hate speech, explicit content, or personal info leaks.
Text: "${text}"

Respond in JSON: {"safe": boolean, "flaggedReason": string | null, "filteredText": string}`,
      config: { responseMimeType: 'application/json' },
    });

    const parsed = JSON.parse(response.text || '{"safe": true, "filteredText": ""}');
    res.json(parsed);
  } catch (error) {
    res.json({ safe: true, filteredText: req.body?.text || '' });
  }
});

// SERVERS & MULTIPLAYER ROOM JOIN
app.post('/api/servers/join', (req, res) => {
  const { gameId, serverId, userId } = req.body;
  res.json({
    success: true,
    connectionToken: `acado_token_${Date.now()}_${Math.random().toString(36).substr(2, 6)}`,
    serverId: serverId || 'srv_default_01',
    ping: 22,
    tickRate: 60,
    serverAuthoritative: true,
  });
});

// IDEMPOTENT MARKETPLACE PURCHASE
const processedTransactions = new Set<string>();
app.post('/api/marketplace/buy', (req, res) => {
  const { transactionId, itemId, price, userId } = req.body;
  
  if (processedTransactions.has(transactionId)) {
    return res.status(409).json({ error: 'Duplicate transaction request prevented.', idempotencyBlocked: true });
  }

  processedTransactions.add(transactionId);
  res.json({
    success: true,
    transactionId,
    itemId,
    deductedCoins: price,
    message: 'Purchase completed successfully!',
  });
});

// START EXPRESS SERVER WITH VITE MIDDLEWARE
async function startServer() {
  if (process.env.NODE_ENV !== 'production') {
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: 'spa',
    });
    app.use(vite.middlewares);
  } else {
    const distPath = path.join(process.cwd(), 'dist');
    app.use(express.static(distPath));
    app.get('*', (req, res) => {
      res.sendFile(path.join(distPath, 'index.html'));
    });
  }

  app.listen(PORT, '0.0.0.0', () => {
    console.log(`🚀 ACADO Platform Server listening on http://0.0.0.0:${PORT}`);
  });
}

startServer();
