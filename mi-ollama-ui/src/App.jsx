// App.jsx
import React from 'react';
import ChatArea from './componentes/chatArea';
import ResourceMonitor from './componentes/resourceMonitor';
import ModelSideBar from './componentes/modelSideBar';
import { ChatProvider } from './context/chatContext';
import './App.css'; // Aquí irá nuestro estilo

function App() {
  return (
    <div className="app-container">

      <ChatProvider>
        <ModelSideBar />
        <ChatArea />
        <ResourceMonitor />
      </ChatProvider>


    </div>
  );
}

export default App;