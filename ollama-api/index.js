const express = require('express');
const cors = require('cors');

const app = express();
const PORT = 3001; // Usamos el 3001 para que no choque con React (que suele usar 5173 o 3000)

// Middlewares (Configuraciones previas)
app.use(cors());             // Permite que tu Frontend (React) le hable a este Backend
app.use(express.json());     // Permite leer datos en formato JSON (lo que envía el chat)

//-------- GET ---------
// Ruta de prueba (Para ver si funciona)
app.get('/', (req, res) => {
    res.send('¡Hola! La API de Ollama está viva 🤖');
});

// Ruta para obtener la lista de modelos (Menú)
app.get('/api/models', async (req, res) => {
    try {
        // Le preguntamos a Ollama: "¿Qué tienes instalado?"
        // Usamos 127.0.0.1 gracias a tu túnel SSH
        const response = await fetch('http://127.0.0.1:11434/api/tags');

        const data = await response.json();

        // Le entregamos la lista limpia a nuestro Frontend
        res.json(data);

    } catch (error) {
        console.error("Error obteniendo modelos:", error);
        res.status(500).json({ error: 'Error al consultar los modelos 📋' });
    }
});


//-------- POST ---------
// Ruta para conversar con Ollama
app.post('/api/chat', async (req, res) => {
    const { model, messages } = req.body;

    try {
        // 1. Llamamos a Ollama activando el Streaming
        const response = await fetch('http://127.0.0.1:11434/api/chat', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
                model: model,
                messages: messages,
                stream: true // <--- Activamos el modo "grifo abierto"
            })
        });

        // 2. Configuramos la cabecera para que el frontend sepa que es texto plano
        res.setHeader('Content-Type', 'text/plain; charset=utf-8');

        // 3. EL CAMBIO CLAVE: No usamos response.json().
        // Usamos un bucle para leer los pedacitos (chunks) conforme llegan
        // y se los pasamos al frontend inmediatamente.
        if (response.body) {
            for await (const chunk of response.body) {
                // 'chunk' es un Buffer (bytes), lo escribimos directo a la respuesta
                res.write(chunk);
            }
        }

        // 4. Cerramos la conexión cuando Ollama termine
        res.end();

    } catch (error) {
        console.error("Error en el stream:", error);
        // Si ya empezamos a escribir (headers sent), no podemos enviar json de error
        if (!res.headersSent) {
            res.status(500).json({ error: 'Error comunicando con Ollama' });
        } else {
            res.end();
        }
    }
});



// Arrancar el servidor
app.listen(PORT, () => {
    console.log(`Servidor corriendo en http://localhost:${PORT}`);
});