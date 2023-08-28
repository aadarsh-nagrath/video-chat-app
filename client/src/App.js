import React from "react";
import {Routes, Route} from "react-router-dom";
import './App.css';
import LobbyScreen from "./pages/Lobby";


function App() {
  return (
    <div className="App">
      <Routes>
        <Route path="/" element={<LobbyScreen/>} />
      </Routes>
    </div>
  );
}

export default App;
