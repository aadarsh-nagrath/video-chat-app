import React, {useEffect, useCallback, useState} from "react";
import { useSocket } from "../context/socketProvider";
//We will create listeners that will tell us that users have joined this room
import ReactPlayer from "react-player";
import peer from "../services/peer";

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

            const offer = await peer.getOffer();
            socket.emit('user:call', {to: remoteSocketId, offer});
            setMyStream(stream);
        }, [remoteSocketId, socket]);
    //install react player 

    const handleIncommingCall = useCallback(async (from, offer)=>{
        setRemoteSocketId(from);
        // turning on connecting user's stream
        const stream = await navigator.mediaDevices.getUserMedia(
        {
            audio:true, 
            video: true
        });
        setMyStream(stream);

        console.log(`Incomming call`, from, offer);
        const ans = await peer.getAnswer(offer);
        socket.emit('call:accepted', {to: from, ans})
    }, [socket]);

    const handleCallAccept = useCallback(({from, ans})=>{
        // whenever Our call is accepted we have to store it in our localDescription
        peer.setLocalDescription(ans);
        console.log("Call Accepted");
    }, []);


    useEffect(() => {
    // Register the event listener when the component mounts
        socket.on("user:joined", handleUserJoined);
        socket.on("incomming:call", handleIncommingCall);
        socket.on("call:accepted", handleCallAccept);

    // Unregister the event listener when the component unmounts
        return () => {
            socket.off("user:joined", handleUserJoined);
            socket.off("incomming:call", handleIncommingCall);
            socket.off("call:accepted", handleCallAccept);
        };
        }, [socket, handleUserJoined, handleIncommingCall, handleCallAccept]);

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
        //Now to send our stream to other users we will create services folder
        )
    }
    </div>
);
};

export default RoomPage;