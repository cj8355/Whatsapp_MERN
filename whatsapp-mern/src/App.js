import React, { useEffect } from "react";
import './App.css';
import Sidebar from "./Sidebar";
import Chat from "./Chat";
import Pusher from 'pusher-js';

function App() {

  useEffect(() => {
    const pusher = new Pusher('8d93cea93a16afc0c97c', {
      cluster: 'us3'
    });

    const channel = pusher.subscribe('messages');
    channel.bind('inserted', (data) => {
      alert(JSON.stringify(data));
    });

  }, [])


  return (
    <div className="app">
      <div className="app__body">
      <Sidebar />
      <Chat />

      </div>

    </div>
  );
}

export default App;
