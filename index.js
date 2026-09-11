const express = require('express');
const { GoogleGenAI } = require('@google/genai');

const app = express();
app.use(express.json());

// Inicializa Gemini usando la API Key que le pasaremos desde Render
const ai = new GoogleGenAI();

// Aquí defines cómo quieres que sea tu NPC
const SYSTEM_INSTRUCTION = `
Eres 'Manolo', un mecánico de 45 años en Los Santos (SA-MP Roleplay).
Hablas con tono informal, un poco rudo pero amigable. 
Tus respuestas deben ser cortas (máximo 2 oraciones) para no saturar el chat de SA-MP.
No te salgas del personaje.
`;

app.post('/npc/chat', async (req, res) => {
    const { playerMessage, playerName } = req.body;

    try {
        const response = await ai.models.generateContent({
            model: 'gemini-2.5-flash',
            contents: `El jugador ${playerName} te dice: "${playerMessage}"`,
            config: {
                systemInstruction: SYSTEM_INSTRUCTION,
                maxOutputTokens: 100,
            }
        });

        res.json({ reply: response.text.trim() });
    } catch (error) {
        console.error("Error al procesar la IA:", error);
        res.json({ reply: "... (Manolo parece estar ocupado arreglando un carro)" });
    }
});

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
    console.log(`Servidor activo en el puerto ${PORT}`);
});

