import { Room, User, CanvasState, Stroke } from "./types";

export const rooms: Map<string, Room> = new Map()
const CHAR_POOL = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789';
const ROOM_CODE_LENGTH = 6;
const socketToRoom = new Map<string, string>();
function generateRoomCode(existingRooms: Map<string, Room>): string {
    let code: string;

    do {
        code = '';
        for (let i = 0; i < ROOM_CODE_LENGTH; i++) {
            const randomIndex = Math.floor(Math.random() * CHAR_POOL.length);
            code += CHAR_POOL[randomIndex];
        }
        // Repeat if code already exists in the rooms Map
    } while (existingRooms.has(code));

    return code;
}

export function createPrivateRoom(roomId: string, host: User, maxPlayers = 15, difficulty: "normal" | "easy" | "hard" | "medium"): Room {
    const newRoom: Room = {
        id: roomId,
        users: [host],
        isPublic: false,
        maxPlayers,
        canvasState: { strokes: [] },
        difficulty
    };
    rooms.set(roomId, newRoom);
    socketToRoom.set(host.socketId, roomId);
    return newRoom;
}
//------------- join room ---------------------------
//mapping socket to room
interface JoinRoomResult {
    room?: Room;      // The room if joining succeeds
    error?: string;   // Error message if joining fails
}
export function joinRoom(socketId:string, username: string, userId: string, roomId?: string): JoinRoomResult { /* TODO */
    if (roomId) {
        const room = rooms.get(roomId);
        // check if user already in room

        if (room) {

            if (room.users.length >= room.maxPlayers) {
                console.log(`Room ${roomId} is full`);
                return {
                    error: "room is already full"
                }; // cannot join
            }
            const alreadyInRoom = room.users.find(u => u.userId === userId);
            if (alreadyInRoom) {
                return { error: "User already in room" };
            }
            // rooms.get(roomId)!.users.push({socketId,username,userId}) this method could have been used for insertion in room 
            // with ! this mark promising compiler get wont return undefined values but we choose another one 
            room.users.push({ socketId, username, userId });
            socketToRoom.set(socketId, room.id);

            return { room };
        }
        else {
            console.log("No room found with this roomId");
            return { error: "Room not found. Please create a private room." };
        }

    }
    else {
        for (const room of rooms.values()) {
            if (room.isPublic && room.users.length < room.maxPlayers) {
                room.users.push({ socketId, username, userId });
                return { room };
            }
        }
        const newRoomId = generateRoomCode(rooms)
        const publicRoom: Room = {
            id: newRoomId,
            users: [{ socketId, username, userId }],
            isPublic: true,
            maxPlayers: 12,
            canvasState: { strokes: [] },
            difficulty: "normal"
        };
        rooms.set(newRoomId, publicRoom);
        socketToRoom.set(socketId, newRoomId);

        return { room: publicRoom };
        /*
      yet to implement 
      return info to frontend
      check for duplicate users
      broadcast user joined using socket
      join queue 
      error handling -v
        */
    }
}

// Map to track which room a socket is in

interface leaveRoomResult {
    room?: Room;      // The room if joining succeeds
    error?: string;   // Error message if joining fails
}
export function leaveRoom(socketId: string, roomId?: string): leaveRoomResult {
    // If roomId not passed, try to get it from the mapping
    const targetRoomId = roomId || socketToRoom.get(socketId);
    if (!targetRoomId) {
        return { error: `No room found for socket ${socketId}` };
    }

    const room = rooms.get(targetRoomId);
    if (!room) {

        socketToRoom.delete(socketId);
        return { error: `Room ${targetRoomId} does not exist` }

    }

    // Remove the user from the room
    room.users = room.users.filter(u => u.socketId !== socketId);

    // Remove socket mapping
    socketToRoom.delete(socketId);

    // If room is empty after removal, delete it
    if (room.users.length === 0) {
        rooms.delete(targetRoomId);

        return { error: `Room ${targetRoomId} deleted (empty)` };
    }

    return { room }; // return updated room
}
export function getUsersInRoom(roomId: string): User[] {
    const room = rooms.get(roomId)
    return room ? room.users : [];
}

export function saveCanvasState(roomId: string, newStrokes: Stroke[]): { room?: Room; error?: string } {
    const room = rooms.get(roomId)
    if (room) {
        if (!room.canvasState) {
            room.canvasState = { strokes: [] };
        }
        room.canvasState.strokes.push(...newStrokes)
        return { room }
    }
    return { error: "room not found" }
    // todo:: if stroke failed to deliever send it again

}
export function getCanvasState(roomId: string): CanvasState | undefined {
    const room = rooms.get(roomId)
    if (room) {
        return room.canvasState ?? { strokes: [] }
    }
}
export function resetCanvasState(roomId: string) {
    const room = rooms.get(roomId)
    if (room) room.canvasState = { strokes: [] }
}