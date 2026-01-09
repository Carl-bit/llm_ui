import { useState, useRef, useEffect } from 'react';
import { useChat } from '../context/chatContext';
import '../css/chatArea.css'; // Asegúrate que este archivo exista
import ReactMarkdown from 'react-markdown';
import { Prism as SyntaxHighlighter } from 'react-syntax-highlighter';
import { vscDarkPlus } from 'react-syntax-highlighter/dist/esm/styles/prism';

function ChatArea() {
    const { currentModel, setLastMetrics } = useChat(); // Usamos setLastMetrics
    const [messages, setMessages] = useState([]);
    const [inputText, setInputText] = useState('');
    const [isLoading, setIsLoading] = useState(false);
    const messagesEndRef = useRef(null);

    const scrollToBottom = () => {
        messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
    };

    useEffect(() => {
        scrollToBottom();
    }, [messages, isLoading]);

    const handleSend = async () => {
        if (inputText.trim() === '') return;

        const newUserMessage = { role: 'user', content: inputText };
        const updatedMessages = [...messages, newUserMessage];

        // Agregamos un mensaje VACÍO del bot para ir llenándolo
        const initialBotMessage = { role: 'assistant', content: '' };

        setMessages([...updatedMessages, initialBotMessage]);
        setInputText('');
        setIsLoading(true);

        try {
            const response = await fetch('/api/chat', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    model: currentModel,
                    messages: updatedMessages
                })
            });

            const reader = response.body.getReader();
            const decoder = new TextDecoder();
            let botContent = ''; // Aquí acumularemos el texto

            while (true) {
                const { done, value } = await reader.read();
                if (done) break;

                // Decodificamos el trozo de datos
                const chunk = decoder.decode(value, { stream: true });

                // Ollama manda múltiples JSONs pegados (ej: "{...}{...}")
                // Vamos a procesar cada línea por separado
                const lines = chunk.split('\n').filter(line => line.trim() !== '');

                for (const line of lines) {
                    try {
                        const json = JSON.parse(line);

                        if (json.done) {
                            // ¡TERMINÓ! Aquí vienen las métricas finales
                            setLastMetrics({
                                totalTime: (json.total_duration / 1e9).toFixed(2),
                                tokenCount: json.eval_count,
                                tokensPerSecond: (json.eval_count / (json.eval_duration / 1e9)).toFixed(2),
                                loadTime: (json.load_duration / 1e6).toFixed(2)
                            });
                        } else if (json.message && json.message.content) {
                            // Es un trozo de texto: Lo agregamos
                            botContent += json.message.content;

                            // Actualizamos la UI en tiempo real
                            setMessages(prev => {
                                const newMsgs = [...prev];
                                // Modificamos solo el último mensaje (el del bot)
                                newMsgs[newMsgs.length - 1] = {
                                    role: 'assistant',
                                    content: botContent
                                };
                                return newMsgs;
                            });
                        }
                    } catch (e) {
                        console.error("Error parseando chunk JSON", e);
                    }
                }
            }

        } catch (error) {
            console.error("Error:", error);
            setMessages(prev => [...prev, { role: 'system', content: '❌ Error de conexión.' }]);
        } finally {
            setIsLoading(false);
        }
    };

    const handleKeyDown = (e) => {
        if (e.key === 'Enter' && !e.shiftKey) {
            e.preventDefault();
            handleSend();
        }
    };

    return (
        <div className="chat-container">
            <h2>Chat con {currentModel}</h2>

            <div className="messages-list">
                {messages.map((msg, index) => (
                    // OJO AQUÍ: Cambiamos la lógica de clases a 'role'
                    <div key={index} className={`message ${msg.role === 'user' ? 'user' : 'bot'}`}>
                        <strong className="sender">
                            {msg.role === 'user' ? 'Yo' : currentModel}:
                        </strong>

                        {/* 2. Reemplazamos el <span> por el componente mágico */}
                        <div className="markdown-content">
                            <ReactMarkdown
                                components={{
                                    code({ node, inline, className, children, ...props }) {
                                        const match = /language-(\w+)/.exec(className || '')
                                        return !inline && match ? (
                                            <SyntaxHighlighter
                                                style={vscDarkPlus}
                                                language={match[1]}
                                                PreTag="div"
                                                {...props}
                                            >
                                                {String(children).replace(/\n$/, '')}
                                            </SyntaxHighlighter>
                                        ) : (
                                            <code className={className} {...props}>
                                                {children}
                                            </code>
                                        )
                                    }
                                }}
                            >
                                {msg.content}
                            </ReactMarkdown>
                        </div>
                    </div>
                ))}

                {/* Solo mostramos los puntos si está cargando Y el último mensaje (el del bot) todavía está vacío */}
                {isLoading && messages[messages.length - 1]?.content === '' && (
                    <div className="typing-indicator">
                        <span></span><span></span><span></span>
                    </div>
                )}
                <div ref={messagesEndRef} />
            </div>

            <div className="input-wrapper">
                <textarea
                    value={inputText}
                    onChange={(e) => setInputText(e.target.value)}
                    placeholder="Escribe un mensaje..."
                    onKeyDown={handleKeyDown}
                    disabled={isLoading}
                />
                <div className="input-footer">
                    <span className="model-label">Modelo: {currentModel}</span>
                    <button onClick={handleSend} disabled={isLoading}>Enviar</button>
                </div>
            </div>
        </div>
    );
}

export default ChatArea;