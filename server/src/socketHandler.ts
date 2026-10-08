import { Server, Socket } from "socket.io";
import { joinRoom, leaveRoom, rooms } from "./rooms";
import { GameManager } from "./gameManager";
import { Stroke } from "./types";

export function initSocketHandler(io: Server, gameManager: GameManager) {
  io.on("connection", (socket: Socket) => {
    console.log("user connected", socket.id);

    let currentRoomId: string | null = null;

    socket.on(
      "joinRoom",
      (data: { username: string; userId: string; roomId?: string }) => {
        const result = joinRoom(
          socket.id,
          data.username,
          data.userId,
          data.roomId,
        );
        if (result.room) {
          socket.join(result.room.id);
          currentRoomId = result.room.id;
          const session = gameManager.getSession(result.room.id);

          socket.emit("roomJoined", {
            room: result.room,
            gameState: session ? "playing" : "waiting",
            // only send if game is running
            currentDrawer: session?.currentDrawer ?? null,
            wordLength: session?.currentWord?.length ?? null,
            scores: session ? Array.from(session.scores.entries()) : [],
            canvasState: result.room.canvasState ?? { strokes: [] },
          });
          socket.to(result.room.id).emit("userJoined", {
            userId: data.userId,
            username: data.username,
            socketId: socket.id,
          });
        } else {
          socket.emit("joinError", { error: result.error });
        }
      },
    );

    socket.on("startGame", () => {
      if (!currentRoomId) {
        socket.emit("error", { message: "You are not in a room" });
        return;
      }
      const room = rooms.get(currentRoomId);
      const host = room?.users[0];
      if (host?.socketId !== socket.id) {
        socket.emit("error", { message: "Only the host can start the game" });
        return;
      }
      gameManager.startNewRound(currentRoomId);
    });

    socket.on("wordChosen", (data: { word: string }) => {
      if (!currentRoomId) return;
      const session = gameManager.getSession(currentRoomId);
      if (session?.currentDrawer?.socketId !== socket.id) {
        socket.emit("error", { message: "You are not the drawer" });
        return;
      }
      gameManager.onWordChosen(currentRoomId, data.word);
    });

    socket.on("draw", (data: { strokes: Stroke[] }) => {
      if (!currentRoomId) return;
      gameManager.saveStroke(currentRoomId, data.strokes);
      socket.to(currentRoomId).emit("draw", data);
    });

    socket.on("guess", (data: { userId: string; guess: string }) => {
      if (!currentRoomId) return;
      gameManager.onGuess(currentRoomId, data.userId, data.guess);
    });
    socket.on(
      "updateSettings",
      (data: {
        difficulty?: "easy" | "medium" | "hard" | "normal";
        maxPlayers?: number;
      }) => {
        if (!currentRoomId) return;

        // only host can change settings
        const room = rooms.get(currentRoomId);
        if (room?.users[0].socketId !== socket.id) return;

        // update room
        if (data.difficulty) room.difficulty = data.difficulty;
        if (data.maxPlayers) room.maxPlayers = data.maxPlayers;

        // broadcast new settings to everyone in room
        io.in(currentRoomId).emit("settingsUpdated", {
          difficulty: room.difficulty,
          maxPlayers: room.maxPlayers,
        });
      },
    );
    socket.on("disconnect", () => {
      if (!currentRoomId) return;

      // check if disconnecting user is host BEFORE leaveRoom removes them
      const wasHost = rooms.get(currentRoomId)?.users[0].socketId === socket.id;

      leaveRoom(socket.id);
      gameManager.onDisconnect(socket.id, currentRoomId);
      socket.to(currentRoomId).emit("userLeft", { socketId: socket.id });

      // if host left, notify everyone about new host
      if (wasHost) {
        const newHost = rooms.get(currentRoomId)?.users[0];
        if (newHost) {
          socket.to(currentRoomId).emit("hostChanged", {
            newHostId: newHost.userId,
          });
        }
      }
    });
  });
}
