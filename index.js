const express = require('express');
const { GoogleGenAI } = require('@google/genai');

const app = express();
app.use(express.json());

const ai = new GoogleGenAI();

// Estado de Caine
let busyPlayer = null; // Guarda el ID o nombre del jugador que está siendo atendido

// Personalidad de Caine (Administrador del Servidor)
const SYSTEM_INSTRUCTION = `
Eres 'Caine', un Administrador IA del servidor Concepto Roleplay en San Andreas Multiplayer.
Tu personalidad es educada, profesional, con autoridad pero muy servicial.
Tu trabajo es atender dudas sobre el servidor, reglas de roleplay o ayudar a los usuarios.
Responde en máximo 2 oraciones para el chat de SA-MP. No te salgas de tu rol de Administrador.
`;

// Endpoint para intentar llamar a Caine
app.post('/npc/call', (req, res) => {
    const { playerName } = req.body;

    // Si Caine está libre o lo llama el mismo jugador
    if (!busyPlayer || busyPlayer === playerName) {
        busyPlayer = playerName;
        return res.json({ status: "OK", message: "Caine va en camino a atenderte." });
    } else {
        return res.json({ 
            status: "BUSY", 
            message: `[Caine IA] Actualmente estoy atendiendo a ${busyPlayer}. Por favor espera un momento.` 
        });
    }
});

// Endpoint para liberar a Caine tras terminar la atención
app.post('/npc/release', (req, res) => {
    const { playerName } = req.body;
    if (busyPlayer === playerName) {
        busyPlayer = null;
        return res.json({ status: "RELEASED" });
    }
    res.json({ status: "IGNORED" });
});

// Endpoint de conversación
app.post('/npc/chat', async (req, res) => {
    const { playerMessage, playerName } = req.body;

    try {
        const response = await ai.models.generateContent({
            model: 'gemini-2.5-flash',
            contents: `El jugador ${playerName} te pregunta/dice: "${playerMessage}"`,
            config: {
                systemInstruction: SYSTEM_INSTRUCTION,
                maxOutputTokens: 100,
            }
        });

        res.json({ reply: response.text.trim() });
    } catch (error) {
        console.error("Error IA:", error);
        res.json({ reply: "Lo siento, tuve un problema de conexión. ¿En qué te puedo ayudar?" });
    }
});

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => console.log(`Caine IA Activo en puerto ${PORT}`));
