Key Concepts

User: A player with socket ID, username, and user ID.

Room: A game room with unique ID, users, canvas state, max players, and public/private flag.

CanvasState: Stores strokes and optional background color.

Maps:

rooms → tracks all rooms.

socketToRoom → maps socket IDs to their room for easy leave/disconnect handling.

Main Functions

generateRoomCode – creates unique room IDs.

createPrivateRoom – creates a private room with a host.

joinRoom – adds a user to a room; creates a public room if none available.

leaveRoom – removes a user; deletes the room if empty.

getUsersInRoom – returns all users in a room (to implement).

saveCanvasState / getCanvasState – manage canvas data (to implement).

Flow

Users can join public or private rooms.

Public rooms are auto-created if none exist.

Private rooms are shared via a room code.

Canvas state is synced per room.

socketToRoom ensures proper handling on leave/disconnect.