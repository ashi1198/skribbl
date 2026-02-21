import { Server, Socket } from "socket.io";
import { joinRoom, leaveRoom } from "./rooms";
import { GameManager } from "./gameManager";

export function initSocketHandler(io: Server, gameManager: GameManager) {
    io.on("connection", (socket: Socket) => {
        console.log("user connected", socket.id);

        let currentRoomId: string | null = null;

        // 1. Join Room
        socket.on("joinRoom", (data: { username: string, userId: string, roomId?: string }) => {
            // call joinRoom from rooms.ts
            // if success → socket.join(roomId), store roomId in currentRoomId
            // emit "roomJoined" back to this socket with room data
            // emit "userJoined" to rest of the room
        });

        // 2. Start Game (host only)
        socket.on("startGame", () => {
            // check currentRoomId exists
            // call gameManager.startNewRound(currentRoomId)
        });

        // 3. Word Chosen (drawer only)
        socket.on("wordChosen", (data: { word: string }) => {
            // call gameManager.onWordChosen(currentRoomId, data.word)
        });

        // 4. Draw
        socket.on("draw", (data: { strokes: any[] }) => {
            // save stroke via gameManager.saveStroke()
            // broadcast to rest of room (not back to drawer)
            // use socket.to(currentRoomId).emit("draw", data)
        });

        // 5. Guess
        socket.on("guess", (data: { userId: string, guess: string }) => {
            // call gameManager.onGuess(currentRoomId, data.userId, data.guess)
        });

        // 6. Disconnect
        socket.on("disconnect", () => {
            // call leaveRoom(socket.id)
            // call gameManager.onDisconnect(socket.id, currentRoomId)
            // emit "userLeft" to room
        });
    });
}