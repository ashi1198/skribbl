import { useState, useEffect } from "react";
import socket from "./Socket";
import type { Room, User } from "./types";
import Lobby from "./components/Lobby";
import Waiting from "./components/Waiting";

type GameScreen = "lobby" | "waiting" | "playing" | "ended";

function App() {
  const [screen, setScreen] = useState<GameScreen>("lobby");
  const [room, setRoom] = useState<Room | null>(null);
  const [currentUser, setCurrentUser] = useState<User | null>(null);
  const [scores, setScores] = useState<[string, number][]>([]);

  useEffect(() => {
    socket.on(
      "roomJoined",
      (data: {
        room: Room;
        gameState: "waiting" | "playing";
        scores: [string, number][];
      }) => {
        setRoom(data.room);
        setScreen(data.gameState);
        setScores(data.scores);
      },
    );

    socket.on("roundStarted", () => {
      setScreen("playing");
    });

    socket.on(
      "gameEnded",
      (data: { winner: string; scores: [string, number][] }) => {
        setScores(data.scores);
        setScreen("ended");
      },
    );

    socket.on(
      "userJoined",
      (data: { userId: string; username: string; socketId: string }) => {
        setRoom((prev) => {
          if (!prev) return prev;
          return {
            ...prev,
            users: [
              ...prev.users,
              {
                userId: data.userId,
                username: data.username,
                socketId: data.socketId,
              },
            ],
          };
        });
      },
    );

    socket.on("userLeft", (data: { socketId: string }) => {
      setRoom((prev) => {
        if (!prev) return prev;
        return {
          ...prev,
          users: prev.users.filter((u) => u.socketId !== data.socketId),
        };
      });
    });
    socket.on("hostChanged", () => {
      setRoom((prev) => {
        if (!prev) return prev;
        return {
          ...prev,
          users: [...prev.users], // users array already updated via userLeft
        };
      });
    });
    return () => {
      socket.off("roomJoined");
      socket.off("roundStarted");
      socket.off("gameEnded");
      socket.off("userJoined");
      socket.off("userLeft");
    };
  }, []);

  return (
    <>
      {screen === "lobby" && <Lobby setCurrentUser={setCurrentUser} />}
      {screen === "waiting" && room && currentUser && (
        <Waiting room={room} currentUser={currentUser} />
      )}
      {screen === "playing" && <div>Game screen coming soon</div>}
      {screen === "ended" && (
        <div>
          <h2>Game Over!</h2>
          {scores.map(([username, score]) => (
            <p key={username}>
              {username}: {score}
            </p>
          ))}
        </div>
      )}
    </>
  );
}

export default App;
