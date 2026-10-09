import { useState } from "react";
import socket from "../../Socket";
import type { User } from "../../types";
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

  const connectAndJoin = (targetRoomId?: string) => {
    if (!username) {
      setError("Please enter a username");
      return;
    }
    const userId = crypto.randomUUID();
    socket.connect();
    socket.once("connect", () => {
      setCurrentUser({ socketId: socket.id!, username, userId });
      socket.emit("joinRoom", { username, userId, roomId: targetRoomId });
    });
  };

  const handleJoin = () => {
    setError(null);
    connectAndJoin(undefined);
  };

  const handleJoinPrivate = async () => {
    setError(null);
    if (!roomId) {
      setError("Please enter a room code");
      return;
    }
    try {
      await axios.get(`http://localhost:5000/room/${roomId}`);
      connectAndJoin(roomId);
    } catch (err) {
      if (axios.isAxiosError(err)) {
        setError(err.response?.data?.error || "Room not found");
      } else {
        setError("An unexpected error occurred");
      }
    }
  };

  const handleGenerateCode = async () => {
    setError(null);
    try {
      const { data } = await axios.post("http://localhost:5000/room/create", {
        difficulty: "normal",
        maxPlayers: 15,
      });
      setGeneratedCode(data.roomId);
    } catch (err) {
      if (axios.isAxiosError(err)) {
        setError(err.response?.data?.error || "Failed to create room");
      } else {
        setError("Failed to create room");
      }
    }
  };

  const handleJoinAsHost = () => {
    setError(null);
    if (generatedCode) connectAndJoin(generatedCode);
  };

  return (
    <div className="lobby-page-wrapper">
      <PointerTrail />
      <div className="user-Details">
        <h1 className="lobby-title">
          skrib<span>bl</span>
        </h1>

        <input
          type="text"
          placeholder="Username"
          value={username}
          onChange={(e) => setUsername(e.target.value)}
        />

        {error && <p className="error-text">{error}</p>}

        {!showPrivate && (
          <button className="btn-primary" onClick={handleJoin}>
            Join Public Room
          </button>
        )}

        {showPrivate && (
          <>
            <input
              placeholder="Enter Room Code"
              value={roomId}
              onChange={(e) => setRoomId(e.target.value)}
            />
            <button className="btn-private" onClick={handleJoinPrivate}>
              Join
            </button>

            <p className="divider">— or —</p>

            {generatedCode ? (
              <>
                <p className="room-code">{generatedCode}</p>
                <button className="btn-primary" onClick={handleJoinAsHost}>
                  Join as Host
                </button>
              </>
            ) : (
              <button className="btn-private" onClick={handleGenerateCode}>
                Create Room
              </button>
            )}
          </>
        )}

        <button
          className="btn-secondary"
          onClick={() => setShowPrivate(!showPrivate)}
        >
          {showPrivate ? "← Back" : "Private Room"}
        </button>
      </div>
    </div>
  );
}

export default Lobby;
