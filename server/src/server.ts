import app from "./app";
import http from "http";
import { Server } from "socket.io";
import { GameManager } from "./gameManager";
import { initSocketHandler } from "./socket";  // ← import it

const port = 5000;

const server = http.createServer(app);

const io = new Server(server, {
  cors: {
    origin: "*",
    methods: ["GET", "POST"]
  }
});

const gameManager = new GameManager(io);
initSocketHandler(io, gameManager);  // ← call it here

server.listen(port, () => {
  console.log(`Server listening on port ${port}`);
});