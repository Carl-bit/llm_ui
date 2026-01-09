import { useChat } from '../context/chatContext';
import '../css/ResourceMonitor.css'; // Asumo que crearás estilos

function ResourceMonitor() {
    const { lastMetrics, currentModel } = useChat();

    return (
        <div className="panel derecho">
            <h2>Monitor</h2>
            <div className="monitor-card">
                <h3>{currentModel}</h3>

                {!lastMetrics ? (
                    <p>Esperando primer mensaje...</p>
                ) : (
                    <div className="metrics-grid">
                        <div className="metric-item">
                            <span className="label">Velocidad</span>
                            <span className="value">{lastMetrics.tokensPerSecond} t/s</span>
                        </div>
                        <div className="metric-item">
                            <span className="label">Tokens</span>
                            <span className="value">{lastMetrics.tokenCount}</span>
                        </div>
                        <div className="metric-item">
                            <span className="label">Tiempo Total</span>
                            <span className="value">{lastMetrics.totalTime}s</span>
                        </div>
                        <div className="metric-item">
                            <span className="label">Carga Modelo</span>
                            <span className="value">{lastMetrics.loadTime}ms</span>
                        </div>
                    </div>
                )}
            </div>

            <div className="console-comparison">
                <small>Compara esto con tu terminal backend para ver la latencia de red.</small>
            </div>
        </div>
    );
}

export default ResourceMonitor;