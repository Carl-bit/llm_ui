// src/components/ChatArea.jsx
import { useChat } from '../context/chatContext';
import { useEffect, useState } from 'react';
import '../css/modelSideBar.css';

function ModelSideBar() {
    const { currentModel, setCurrentModel, providerName, setProviderName } = useChat();
    const [models, setModels] = useState([]);

    useEffect(() => {
        // 1. Creamos una función asíncrona interna
        const fetchModels = async () => {
            try {
                // Hacemos la llamada a TU servidor intermedio (Node.js)
                const response = await fetch('/api/models');

                const data = await response.json();

                // AQUI es donde guardamos la lista en el estado local
                // Ojo: Ollama devuelve un objeto { models: [...] }
                setModels(data.models);

            } catch (error) {
                console.error("Error cargando modelos:", error);
            }
        };

        // 2. Ejecutamos la función inmediatamente
        fetchModels();

    }, []); // 3. Los corchetes vacíos aseguran que solo pase 1 vez al iniciar

    useEffect(() => {
        setProviderName('Ollama');
    }, []);

    return (
        <div className="panel izquierdo">
            <h2>{providerName}</h2>
            <ul className="model-list"> {/* Agregué una clase para limpiar estilos */}
                {models.map(model => (
                    <li key={model.name}>
                        <button
                            // AQUÍ ESTÁ EL CAMBIO: Agregamos la clase 'active' si coincide
                            className={`model-btn ${currentModel === model.name ? 'active' : ''}`}
                            onClick={() => setCurrentModel(model.name)}
                        >
                            <div className="model-info">
                                <span className="model-name">{model.name}</span>
                                <span className="model-tag">{model.details.parameter_size}</span>
                            </div>
                        </button>
                    </li>
                ))}
            </ul>
        </div>
    );
}


export default ModelSideBar;