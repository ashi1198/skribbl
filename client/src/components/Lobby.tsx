import { useState } from "react";
import socket from "../Socket";
import type { User } from "../types";
import type { Dispatch, SetStateAction } from "react";
import axios from "axios";
import "./Lobby.css";
import { PointerTrail } from "./PointerTrail";
interface LobbyProps {
  setCurrentUser: Dispatch<SetStateAction<User | null>>;
}

function Lobby({ setCurrentUser }: LobbyProps) {
  const [username, setUsername] = useState("");
  const [roomId, setRoomId] = useState("");
  const [showPrivate, setShowPrivate] = useState(false);
  const [generatedCode, setGeneratedCode] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);

  const connectAndJoin = (roomId?: string) => {
    if (!username) {
      setError("Please enter a username");
      return;
    }
    const userId = crypto.randomUUID();
    socket.connect();
    socket.once("connect", () => {
      setCurrentUser({ socketId: socket.id!, username, userId });
      socket.emit("joinRoom", { username, userId, roomId });
    });
  };

  // join public room
  const handleJoin = () => {
    connectAndJoin(undefined);
  };

  // join someone else's private room

  const handleJoinPrivate = async () => {
    if (!roomId) {
      setError("Please enter a room code");
      return;
    }
    try {
      await axios.get(`http://localhost:5000/room/${roomId}`);
      connectAndJoin(roomId);
    } catch (err) {
      // 1. Check if the error is a valid Axios error
      if (axios.isAxiosError(err)) {
        const backendError =
          err.response?.data?.error || err.response?.data?.message;
        setError(backendError || "Room not found");
      } else {
        // 2. Handle generic non-network errors (e.g., code crashes)
        setError("An unexpected error occurred");
      }
    }
  };

  // generate a new room code
  const handleGenerateCode = async () => {
    try {
      const { data } = await axios.post("http://localhost:5000/room/create", {
        difficulty: "normal",
        maxPlayers: 15,
      });
      setGeneratedCode(data.roomId);
    } catch (err) {
      // 1. Check if the error is a valid Axios error
      if (axios.isAxiosError(err)) {
        const backendError =
          err.response?.data?.error || err.response?.data?.message;
        setError(backendError || "Failed to create room");
      } else {
        setError("Failed to create room");
      }
    }
  };

  // join as host after generating code
  const handleJoinAsHost = () => {
    if (generatedCode) connectAndJoin(generatedCode);
  };

  return (
    <div className="lobby-page-wrapper">
      <PointerTrail />
      <div className="user-Details">
        <input
          type="text"
          placeholder="Username"
          value={username}
          onChange={(e) => setUsername(e.target.value)}
        />

        {error && <p style={{ color: "red" }}>{error}</p>}

        {!showPrivate && <button onClick={handleJoin}>Join Public Room</button>}

        {showPrivate && (
          <>
            <input
              placeholder="Enter Room Code"
              value={roomId}
              onChange={(e) => setRoomId(e.target.value)}
            />
            <button onClick={handleJoinPrivate}>Join</button>

            <p>— or —</p>

            {generatedCode ? (
              <>
                <p>
                  Your Code: <strong>{generatedCode}</strong>
                </p>
                <button onClick={handleJoinAsHost}>Join as Host</button>
              </>
            ) : (
              <button onClick={handleGenerateCode}>Create Room</button>
            )}
          </>
        )}
        <button onClick={() => setShowPrivate(!showPrivate)}>
          {showPrivate ? "Back" : "Private Room"}
        </button>
      </div>
    </div>
  );
}

export default Lobby;
