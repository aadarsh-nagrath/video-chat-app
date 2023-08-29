import React, {useState, useCallback, useEffect} from "react";
// will use callback for form submission
import {useSocket} from "../context/socketProvider";
import "./Lobby.css";
import { useNavigate } from "react-router-dom";
//navigate will help to naviagate the page when needed

const LobbyScreen = ()=> {

    const [email, setEmail] = useState('');
    const [room, setRoom] = useState('');

    const socket = useSocket('');
    const navigate = useNavigate();

    // console.log(socket);

    const handleSubmit = useCallback((e)=>{
        e.preventDefault();
        socket.emit('room:join', {email, room});

    }, [email, room, socket]);

    const handleJoinRoom = useCallback((data)=>{
        const {room} = data;
        navigate(`/room/${room}`);
    }, [navigate]);
    //the handleJoinRoom function is invoked as a result of an event received from the socket connection.

    useEffect(()=>{
        socket.on('room:join', handleJoinRoom);
        return () => (
            socket.off('room:join', handleJoinRoom)
        );
    }, [socket, handleJoinRoom]);

    return(
        <div>
            <h1>LOBBY</h1>
            <form onSubmit={handleSubmit}>
                <label htmlFor="email">Email-Id: </label>
                <input type="email" id="email" value={email} onChange={(e)=>setEmail(e.target.value)} />
                <br/>
                <label htmlFor="room">Room Number</label>
                <input type="text" id="room" value={room} onChange={(e)=>setRoom(e.target.value)}  />
                <br/>
                <button>Join</button>
            </form>
        </div>
    );
};

export default LobbyScreen;