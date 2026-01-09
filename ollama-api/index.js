const express = require('express');
const cors = require('cors');

const app = express();

// --- CAMBIO 1: El Puerto ---
// Usamos 8000 porque en Nginx pusimos "proxy_pass http://backend:8000"
const PORT = process.env.PORT || 8000;

// --- CAMBIO 2: La URL de Ollama ---
// Si estamos en Docker, usará la variable de entorno. Si es local, usa localhost.
const OLLAMA_URL = process.env.OLLAMA_HOST || 'http://127.0.0.1:11434';

app.use(cors());
app.use(express.json());

//-------- GET ---------
app.get('/', (req, res) => {
    res.send('¡Hola! La API de Ollama está viva 🤖');
});

app.get('/api/models', async (req, res) => {
    try {
        console.log(`Consultando modelos a: ${OLLAMA_URL}/api/tags`); // Log para depurar

        // Usamos la variable dinámica OLLAMA_URL
        const response = await fetch(`${OLLAMA_URL}/api/tags`);

        const data = await response.json();
        res.json(data);
    } catch (error) {
        console.error("Error obteniendo modelos:", error);
        res.status(500).json({ error: 'Error al consultar los modelos 📋' });
    }
});

//-------- POST ---------
app.post('/api/chat', async (req, res) => {
    const { model, messages } = req.body;
    try {
        // Usamos la variable dinámica OLLAMA_URL
        const response = await fetch(`${OLLAMA_URL}/api/chat`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
                model: model,
                messages: messages,
                stream: true
            })
        });

        res.setHeader('Content-Type', 'text/plain; charset=utf-8');

        if (response.body) {
            for await (const chunk of response.body) {
                res.write(chunk);
            }
        }
        res.end();

    } catch (error) {
        console.error("Error en el stream:", error);
        if (!res.headersSent) {
            res.status(500).json({ error: 'Error comunicando con Ollama' });
        } else {
            res.end();
        }
    }
});

app.listen(PORT, () => {
    console.log(`Servidor corriendo en el puerto ${PORT}`);
    console.log(`Conectando a Ollama en: ${OLLAMA_URL}`);
});