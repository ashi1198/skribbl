import { useEffect, useState } from "react";
import socket from "../Socket";
import type { User, Room } from "../types";

interface WaitingProps {
  room: Room;
  currentUser: User;
}

function Waiting({ room, currentUser }: WaitingProps) {
  const isHost = room.users[0]?.userId === currentUser.userId;

  const handleStartGame = () => {
    // emit "startGame" to server
  };

  return (
    <div className="waiting-wrapper">
      {/* 1. Room code display — so host can share it */}
      <div className="header">
        <p className="roomId">{room.id}</p>
      </div>
      <div className="user-display-panel">
        {/* 2. Players list — map over room.users */}
        {room.users.map((user) => {
          return (
            <p key={user.userId} className="user-name">
              {user.username} {room.users[0].userId === user.userId && "(host)"}
            </p>
          );
        })}
      </div>
      {/* 3. Start button — only visible if isHost */}
      {/* 4. "Waiting for host to start..." — visible if not host */}
      <div className="game-settings-panel">
        <select className="difficulty" value={}></select>
      </div>
    </div>
  );
}

export default Waiting;
