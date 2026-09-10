/**
 * ACADO Express Backend Server
 */

import express from 'express';
import path from 'path';
import { createServer as createViteServer } from 'vite';
import { GoogleGenAI, Type } from '@google/genai';
import { synthesizeProceduralWorld } from './server/worldGenerator.js';

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

function withTimeout<T>(promise: Promise<T>, ms = 6000): Promise<T> {
  return Promise.race([
    promise,
    new Promise<T>((_, reject) => setTimeout(() => reject(new Error('AI generation timed out')), ms)),
  ]);
}

// AI WORLD BUILDER ENDPOINT
app.post('/api/ai/build-world', async (req, res) => {
  try {
    const { prompt, style, complexity } = req.body;
    if (!prompt) {
      return res.status(400).json({ error: 'Prompt is required' });
    }

    let parsedResult: any = null;
    let source: 'gemini' | 'synthesizer' = 'gemini';

    const tryGenerate = async (modelName: string) => {
      const call = ai.models.generateContent({
        model: modelName,
        contents: `You are the ACADO AI 3D World Architect. Convert the user's game request into a valid JSON 3D World definition for ACADO Studio.

User Prompt: "${prompt}"
Atmosphere Style: "${style || 'dynamic'}"
Complexity: "${complexity || 'balanced'}"

Generate a JSON object conforming strictly to this structure:
{
  "title": "Exciting Experience Title",
  "description": "Engaging description of this 3D experience (1-2 sentences)",
  "category": "Racing" | "Obby" | "Adventure" | "Sports" | "RPG" | "Simulation",
  "tags": ["3D", "Community", "Custom", "Action"],
  "worldData": {
    "skyColor": "#0a0a23",
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
        "color": "#hex",
        "material": "smooth" | "brick" | "neon" | "metal" | "wood" | "glass",
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
        "rewardCoins": 100,
        "rewardXp": 200
      }
    ]
  }
}

Include 10 to 18 realistic 3D objects arranged thoughtfully in 3D space with reasonable scale and coordinate positions (including platforms, hazards, collectible gold coins, and a finish_line gate).`,
        config: {
          responseMimeType: 'application/json',
        },
      });

      const response = await withTimeout(call, 6500);
      const jsonText = response.text || '{}';
      return JSON.parse(jsonText);
    };

    // 1. Try Fast Flash-Lite Model first for speed & reliability
    try {
      parsedResult = await tryGenerate('gemini-3.1-flash-lite');
    } catch (err1: any) {
      console.warn('gemini-3.1-flash-lite unavailable/timed out, trying procedural synthesis...', err1?.message);
    }

    if (parsedResult && (parsedResult.worldData || parsedResult.objects)) {
      const finalWorld = parsedResult.worldData || parsedResult;
      if (!Array.isArray(finalWorld.objects)) finalWorld.objects = [];
      if (!Array.isArray(finalWorld.npcs)) finalWorld.npcs = [];
      if (!Array.isArray(finalWorld.quests)) finalWorld.quests = [];
      if (!Array.isArray(finalWorld.scripts)) finalWorld.scripts = [];
      if (!finalWorld.skyColor) finalWorld.skyColor = '#0a0a23';
      if (!finalWorld.spawnPoint) finalWorld.spawnPoint = [0, 1, 0];

      return res.json({
        success: true,
        source: 'gemini',
        worldData: finalWorld,
        suggestedTitle: parsedResult.title || 'AI Generated 3D Experience',
        suggestedDescription: parsedResult.description || `Custom AI-crafted world created from prompt: "${prompt}"`,
        suggestedCategory: parsedResult.category || 'Adventure',
        suggestedTags: parsedResult.tags || ['3D', 'Community', 'Custom'],
      });
    }

    // 3. Fallback: Procedural Synthesis Engine
    const synth = synthesizeProceduralWorld(prompt, style);
    return res.json({
      success: true,
      source: 'synthesizer',
      worldData: synth.worldData,
      suggestedTitle: synth.title,
      suggestedDescription: synth.description,
      suggestedCategory: synth.category,
      suggestedTags: synth.tags,
    });
  } catch (error: any) {
    console.error('AI World Builder fallback activated:', error);
    const fallback = synthesizeProceduralWorld(req.body?.prompt || 'Adventure World');
    return res.json({
      success: true,
      source: 'synthesizer',
      worldData: fallback.worldData,
      suggestedTitle: fallback.title,
      suggestedDescription: fallback.description,
      suggestedCategory: fallback.category,
      suggestedTags: fallback.tags,
    });
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
