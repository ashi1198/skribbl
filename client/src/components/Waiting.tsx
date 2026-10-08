import { useEffect, useState } from "react";
import socket from "../Socket";
import type { User, Room } from "../types";
import { GameSettingsPanel } from "./GameSettingsPanel";
import "./Waiting.css";
interface WaitingProps {
  room: Room;
  currentUser: User;
}

export type UpdatedRoom = {
  difficulty: "easy" | "medium" | "hard" | "normal";
  maxPlayers: number;
  rounds: number;
  turnTime: number;
};

function Waiting({ room, currentUser }: WaitingProps) {
  const isHost = room.users[0]?.userId === currentUser.userId;

  const [settings, setSettings] = useState<UpdatedRoom>({
    difficulty: "normal",
    maxPlayers: 15,
    rounds: 3,
    turnTime: 60,
  });

  useEffect(() => {
    socket.on("settingsUpdated", (data: UpdatedRoom) => {
      setSettings(data);
    });

    return () => {
      socket.off("settingsUpdated");
    };
  }, []);

  const handleSettingChange = (
    key: keyof UpdatedRoom,
    value: string | number,
  ) => {
    const updated = { ...settings, [key]: value };
    setSettings(updated);
    socket.emit("updateSettings", updated);
  };

  const handleStartGame = () => {
    socket.emit("startGame");
  };

  return (
    <div className="waiting-wrapper">
      {/* header */}
      <div className="header">
        <p className="roomId">
          Room: <strong>{room.id}</strong>
        </p>
      </div>

      <div className="waiting-body">
        {/* players list */}
        <div className="user-display-panel">
          <h3>
            Players ({room.users.length}/{settings.maxPlayers})
          </h3>
          {room.users.map((user) => (
            <p key={user.userId} className="user-name">
              {room.users[0].userId === user.userId ? "👑" : "✓"}{" "}
              {user.username}
            </p>
          ))}
        </div>

        {/* settings panel */}
        <div className="game-settings-panel">
          {isHost ? (
            <GameSettingsPanel
              settings={settings}
              handleSettingChange={handleSettingChange}
              isHost={isHost}
            />
          ) : (
            <>
              <h3>Game Settings</h3>
              <p>Difficulty: {settings.difficulty}</p>
              <p>Max Players: {settings.maxPlayers}</p>
              <p>Rounds: {settings.rounds}</p>
              <p>Turn Time: {settings.turnTime}s</p>
            </>
          )}
        </div>
      </div>

      {/* bottom action */}
      <div className="waiting-footer">
        {isHost ? (
          <button className="btn-start" onClick={handleStartGame}>
            Start Game
          </button>
        ) : (
          <p className="waiting-text">Waiting for host to start...</p>
        )}
      </div>
    </div>
  );
}

export default Waiting;
