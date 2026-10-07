import express from "express";
import cors from "cors";
import { rooms } from "./rooms";

const app = express();

app.use(cors({ origin: "*" }));
app.use(express.json());

app.get("/health", (req, res) => {
    res.json({ status: "ok" });
});

// Check if room exists and is joinable
app.get("/room/:id", (req, res) => {
    const room = rooms.get(req.params.id);
    if (!room) {
        res.status(404).json({ error: "Room not found" });
        return;
    }
    res.json({
        id: room.id,
        playerCount: room.users.length,
        maxPlayers: room.maxPlayers,
        isPublic: room.isPublic,
        difficulty: room.difficulty,
        isFull: room.users.length >= room.maxPlayers
    });
      if (room.users.length >= room.maxPlayers) {
        res.status(403).json({ error: "Room is full" });
        return;
    }
});

// Create a private room
app.post("/room/create", (req, res) => {
    const { difficulty = "normal", maxPlayers = 15 } = req.body;

    const validDifficulties = ["easy", "medium", "hard", "normal"];
    if (!validDifficulties.includes(difficulty)) {
        res.status(400).json({ error: "Invalid difficulty" });
        return;
    }

    // generate unique room code
    let roomId = "";
    do {
        roomId = Math.random().toString(36).substring(2, 8).toUpperCase();
    } while (rooms.has(roomId));

    rooms.set(roomId, {
        id: roomId,
        users: [],
        isPublic: false,
        maxPlayers,
        canvasState: { strokes: [] },
        difficulty
    });

    res.status(201).json({ roomId });
});

export default app;