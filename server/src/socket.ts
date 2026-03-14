import { Server, Socket } from "socket.io";
import { joinRoom, leaveRoom, rooms } from "./rooms";
import { GameManager } from "./gameManager";
import { Stroke } from "./types";

export function initSocketHandler(io: Server, gameManager: GameManager) {
    io.on("connection", (socket: Socket) => {
        console.log("user connected", socket.id);

        let currentRoomId: string | null = null;

        // 1. Join Room
        socket.on("joinRoom", (data: { username: string, userId: string, roomId?: string }) => {
            // call joinRoom from rooms.ts
            const result = joinRoom(socket.id, data.username, data.userId, data.roomId)
            // if success → socket.join(roomId), store roomId in currentRoomId
            if (result.room) {
                socket.join(result.room.id)
                currentRoomId = result.room.id
                socket.emit("roomJoined", {
                   room:result.room
                });
                socket.to(result.room.id).emit("userJoined", {
                    userId: data.userId,
                    username: data.username
                })
            }
            else if (result.error) {
                socket.emit("joinError", { error: result.error });
            }
        });

        // 2. Start Game (host only)
        socket.on("startGame", () => {
            if (!currentRoomId) {
                socket.emit("error", { message: "You are not in a room" });
                return;
            }

            const room = rooms.get(currentRoomId);
            const host = room?.users[0];  // first user is always the host

            if (host?.socketId !== socket.id) {
                socket.emit("error", { message: "Only the host can start the game" });
                return;
            }

            gameManager.startNewRound(currentRoomId);
        });

        // 3. Word Chosen (drawer only)
        socket.on("wordChosen", (data: { word: string }) => {
            if (!currentRoomId) return;

            const session = gameManager.getSession(currentRoomId);
            if (session?.currentDrawer?.socketId !== socket.id) {
                socket.emit("error", { message: "You are not the drawer" });
                return;
            }

            gameManager.onWordChosen(currentRoomId, data.word);
        });

        // 4. Draw
        socket.on("draw", (data: { strokes: Stroke[] }) => {
            if(!currentRoomId) return 
            gameManager.saveStroke(currentRoomId,data.strokes)
            socket.to(currentRoomId).emit("draw",data)
        });

        // 5. Guess
        socket.on("guess", (data: { userId: string, guess: string }) => {
            // call gameManager.onGuess(currentRoomId, data.userId, data.guess)
            if(!currentRoomId) return
            gameManager.onGuess(currentRoomId,data.userId,data.guess)
        });

        // 6. Disconnect
        socket.on("disconnect", () => {
            if (!currentRoomId) return;

            leaveRoom(socket.id);
            gameManager.onDisconnect(socket.id, currentRoomId);
            socket.to(currentRoomId).emit("userLeft", { socketId: socket.id });
        });
    });
}