import { useState } from "react";
import socket from "../socket";
import { User } from "../types";
import { Dispatch, SetStateAction } from "react";

interface LobbyProps {
    setCurrentUser: Dispatch<SetStateAction<User | null>>;
}

function Lobby({ setCurrentUser }: LobbyProps) {
    const [username, setUsername] = useState("");
    const [roomId, setRoomId] = useState("");  // optional, empty = public room

    const handleJoin = () => {
        // 1. validate username not empty → return early if empty
        
        // 2. generate userId
        const userId = crypto.randomUUID();

        // 3. connect socket
        socket.connect();

        // 4. emit joinRoom with username, userId, roomId (roomId optional)
        // hint: if roomId is empty string pass undefined instead
        
        // 5. setCurrentUser with username, userId, socketId
        // hint: socket.id gives you the socketId
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
