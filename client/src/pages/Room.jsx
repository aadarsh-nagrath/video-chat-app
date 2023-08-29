import React, {useEffect, useCallback, useState} from "react";
import { useSocket } from "../context/socketProvider";
//We will create listeners that will tell us that users have joined this room
import ReactPlayer from "react-player";

const RoomPage = () => {
    const socket = useSocket();
    const [remoteSocketId, setRemoteSocketId] = useState(null);
    const [myStream, setMyStream] = useState();

    const handleUserJoined = useCallback(({ email, id }) => {
        console.log(`Email ${email} joined room`);
        setRemoteSocketId(id);
    }, []);

    const handleCall = useCallback(async ()=>{
    const stream = await navigator.mediaDevices.getUserMedia(
        {
            audio:true, 
            video: true
        });

        setMyStream(stream);
    }, []);
    //install react player 


    useEffect(() => {
    // Register the event listener when the component mounts
        socket.on("user:joined", handleUserJoined);

    // Unregister the event listener when the component unmounts
        return () => {
            socket.off("user:joined", handleUserJoined);
        };
        }, [socket, handleUserJoined]);

    return (
    <div>
    <h1>Room Page</h1>
    <h2> {remoteSocketId ? "Connected" : "No one in the room"} </h2>
    {
        remoteSocketId && <button onClick={handleCall}>Call</button>
    }
    {
        myStream && (
        <>
            <h1>My Stream</h1>
            <ReactPlayer playing muted height="300px" width="500px" url={myStream} />
        </>
        )
    }
    </div>
);
};

export default RoomPage;