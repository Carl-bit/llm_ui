import { createContext, useState, useContext } from 'react';

// 1. Crear el Contexto (La Frecuencia de Radio)
const ChatContext = createContext();
// 2. Crear el Proveedor (La Torre de Transmisión)
// Este componente envolverá a toda tu aplicación
export function ChatProvider({ children }) {
    const [currentModel, setCurrentModel] = useState('phi3'); // Modelo por defecto
    const [providerName, setProviderName] = useState('Ollama');
    const [lastMetrics, setLastMetrics] = useState(null);
    // Este objeto 'value' es lo que se transmite por el aire
    const value = {
        currentModel,
        setCurrentModel,
        providerName,
        setProviderName,
        lastMetrics,
        setLastMetrics
    };

    return (
        <ChatContext.Provider value={value}>
            {children}
        </ChatContext.Provider>
    );
}

// 3. El Receptor (Un Hook personalizado)
// Esto es para no tener que importar 'useContext' y 'ChatContext' en cada archivo.
// Simplemente usaremos 'useChat()' y listo.
export function useChat() {
    return useContext(ChatContext);
}