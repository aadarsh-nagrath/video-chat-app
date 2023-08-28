// Providers help us to
import React, {createContext, useMemo, useContext} from "react";
import {io} from 'socket.io-client';

const socketContext = createContext(null);

export const useSocket = ()=> {
    const socket = useContext(socketContext);
    return socket;
};

export const SocketProvider = (props) =>{

    const socket = useMemo(() => io("localhost:8000"), [])
    {/*// useMemo so that our socket does not initiallize again and again*/}

    return(
        <socketContext.Provider value={socket}>
            {/*//the value here above will be the actual socket value*/}
            {props.children}
        </socketContext.Provider>
    );
};
// The useMemo hook is used to ensure that the socket instance is only created once and reused across renders.
// The socket instance is provided to the context using the socketContext.Provider component, making it available to any child components that use the useSocket hook.
// The props.children are rendered within the context provider, allowing any components wrapped by socketProvider to access the socket.