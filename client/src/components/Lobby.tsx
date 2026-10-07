import { useState } from "react";
import socket from "../Socket";
import { User } from "../types";
import { Dispatch, SetStateAction } from "react";

interface LobbyProps {
    setCurrentUser: Dispatch<SetStateAction<User | null>>;
}

function Lobby({ setCurrentUser }: LobbyProps) {
    const [username, setUsername] = useState("");
    const [roomId, setRoomId] = useState("");  // optional, empty = public room

    const handleJoin = () => {
        
        if(!username) return ;
        // 2. generate userId
        const userId = crypto.randomUUID();

        // 3. connect socket
        socket.connect();
        socket.once("connect",()=>{
            setCurrentUser({
            socketId:socket.id ?? "",
            username,
            userId
        })
        
        socket.emit("joinRoom",{
            username,userId,roomId:roomId || undefined});
        }) 
        
       
    };

    return (
        <div>
            {/* input for username */}
            {/* input for roomId (optional, placeholder="Room ID (optional)") */}
            {/* button that calls handleJoin */}
        </div>
    );
}

export default Lobby;