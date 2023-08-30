import React, {useEffect, useCallback, useState} from "react";
import { useSocket } from "../context/socketProvider";
//We will create listeners that will tell us that users have joined this room
import ReactPlayer from "react-player";
import peer from "../services/peer";

const RoomPage = () => {
    const socket = useSocket();
    const [remoteSocketId, setRemoteSocketId] = useState(null);
    const [myStream, setMyStream] = useState();
    const [remoteStream, setRemoteStream] = useState();

    const handleUserJoined = useCallback(({ email, id }) => {
        console.log(`Email ${email} joined room`);
        setRemoteSocketId(id);
    }, []);

    const handleCall = useCallback(async ()=>{
        const stream = await navigator.mediaDevices.getUserMedia(
        {
            audio:true, 
            video: true,
        });

        const offer = await peer.getOffer();
        socket.emit("user:call", {to: remoteSocketId, offer});
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
        socket.emit("call:accepted", {to: from, ans});
    }, [socket]);

    const sendStreams = useCallback(() => {
        for (const track of myStream.getTracks()){
            peer.peer.addTrack(track, myStream);
        };
    }, [myStream]);

    const handleCallAccept = useCallback(({from, ans})=>{
        // whenever Our call is accepted we have to store it in our localDescription
        peer.setLocalDescription(ans);
        console.log("Call Accepted");
        sendStreams();
    }, [sendStreams]);

    const handleNegoNeeded = useCallback(async ()=> {
        const offer = await peer.getOffer();
        socket.emit("peer:nego:needed", {offer, to: remoteSocketId});
    }, [remoteSocketId, socket]);

    useEffect(()=>{
        peer.peer.addEventListener("negotiationneeded", handleNegoNeeded );

        return ()=> {
            peer.peer.removeEventListener("negotiationneeded", handleNegoNeeded);
        };
    }, [handleNegoNeeded]);

    const handleNegoNeedIncoming = useCallback(async({from, offer})=>{
        const ans = await peer.getAnswer(offer);
        socket.emit("peer:nego:done", {to: from, ans});
    }, [socket]);

    const handleNegoNeedFinal = useCallback(async({ans})=>{
        await peer.setLocalDescription(ans);
    }, []);

    useEffect(()=>{
        peer.peer.addEventListener('track', async (ev) =>{
            const remoteStream = ev.streams;
            console.log("GOT TRACKS!!");
            setRemoteStream(remoteStream[0]);
        });
    }, []);


    useEffect(() => {
    // Register the event listener when the component mounts
        socket.on("user:joined", handleUserJoined);
        socket.on("incomming:call", handleIncommingCall);
        socket.on("call:accepted", handleCallAccept);
        socket.on("peer:nego:needed", handleNegoNeedIncoming);
    // to recieve the call from 2nd user
        socket.on("peer:nego:final", handleNegoNeedFinal);

    // Unregister the event listener when the component unmounts
        return () => {
            socket.off("user:joined", handleUserJoined);
            socket.off("incomming:call", handleIncommingCall);
            socket.off("call:accepted", handleCallAccept);
            socket.off("peer:nego:needed", handleNegoNeedIncoming);
            socket.off("peer:nego:final", handleNegoNeedFinal);
        };
    }, [socket, handleUserJoined, handleIncommingCall, handleCallAccept, handleNegoNeedFinal, handleNegoNeedIncoming]);

    return (
    <div>
    <h1>Room Page</h1>
    <h2> {remoteSocketId ? "Connected" : "No one in the room"} </h2>
    { myStream && <button onClick={sendStreams} >Send Stream</button> }
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
    {
        remoteStream && (
        <>
            <h1>Remote Stream</h1>
            <ReactPlayer playing muted height="300px" width="500px" url={remoteStream} />
        </>
        //Now to send streams to each other - exchanging 
        )
    }
    </div>
);
};

export default RoomPage;