// gameManager.ts
import { Room, User, Stroke } from "./types";
import { getUsersInRoom, saveCanvasState, getCanvasState, resetCanvasState, rooms, createPrivateRoom } from "./rooms";
import { getRandomWord, WordCategory } from "./words";
import { Server } from "socket.io"

/**
 * Interface representing a single game session for a room
 */
interface GameSession {
    roomId: string;
    currentDrawer: User | null;
    currentWord: string | null;
    usedWords: Set<string>;
    roundNumber: number;
    scores: Map<string, number>;
    drawnYet: Set<string>;
    timer?: NodeJS.Timeout;
    turnTime: number;
    turnStartedAt: number;   // ← ADD THIS
    correctGuesser: Set<string>;
    maxRounds:number
}

/**
 * GameManager class handles all game logic per room
 */
export class GameManager {
    private sessions: Map<string, GameSession>;
    private io: Server
    constructor(io: Server) {
        this.sessions = new Map();
        this.io = io;
    }


    createSession(roomId: string, turnTime = 60,maxRounds=3) {
        const session: GameSession = {
            roomId,
            currentDrawer: null,
            currentWord: null,
            usedWords: new Set(),
            roundNumber: 0,
            scores: new Map(),
            drawnYet: new Set(),
            turnTime,
            turnStartedAt: 0,
            correctGuesser: new Set(),
            maxRounds

        };
        this.sessions.set(roomId, session);
        return session;
    }

    /**
     * Start a new round: resets round-specific data
     */
    startNewRound(roomId: string) {
        const session = this.sessions.get(roomId);
        if (!session) return;
         if (session.roundNumber >= session.maxRounds) {
        this.endGame(roomId);
        return;
    }
        session.roundNumber++;
        session.drawnYet.clear();
        session.currentDrawer = null;
        session.currentWord = null;
        this.resetCanvas(roomId);

        // Notify users a new round started
        // broadcastToRoom(roomId, "roundStarted", { roundNumber: session.roundNumber });
        this.io.in(roomId).emit("roundStarted", {
            roundNumber: session.roundNumber
        });
        // Start first drawer of this round
        this.startRound(roomId);
    }

    /**
     * Start a drawer's turn within the round
     */
    startRound(roomId: string) {
        const session = this.sessions.get(roomId);
        if (!session) return;

        const room = rooms.get(roomId);
        if (!room) {
            console.error("Room not found for startRound");
            return;
        }

        const users = getUsersInRoom(roomId);
        const eligibleDrawers = users.filter(u => !session.drawnYet.has(u.userId));

        if (eligibleDrawers.length === 0) {
            // All users have drawn, start a new round
            this.startNewRound(roomId);
            return;
        }

        // Pick a random drawer from eligible users
        const randomIndex = Math.floor(Math.random() * eligibleDrawers.length);
        const drawer = eligibleDrawers[randomIndex];
        session.currentDrawer = drawer;
        session.drawnYet.add(drawer.userId);

        // Pick 3 word candidates
        const candidates: string[] = [];
        const difficulty: WordCategory = room.difficulty ?? "normal"; // fallback if undefined
        while (candidates.length < 3) {
            const { word } = getRandomWord(difficulty, session.usedWords);
            if (!word) break; // fallback if pool exhausted
            if (!candidates.includes(word)) {
                candidates.push(word);
            }
        }

        this.resetCanvas(roomId);
        
        this.io.in(roomId).emit("clearCanvas"); // ← ADD THIS
        this.io.to(drawer.socketId).emit("chooseWord", {
            wordOptions: candidates
        });
        this.io.in(roomId).emit("newTurn", {
            drawer: {
                userId: drawer.userId,
                username: drawer.username
            }
        })
    }
    onWordChosen(roomId: string, chosenWord: string) {
        const session = this.sessions.get(roomId);
        if (!session) return;
        if (session.timer) {
            clearTimeout(session.timer);
        }
        session.currentWord = chosenWord;
        session.usedWords.add(chosenWord);
        session.turnStartedAt = Date.now();  // ← ADD THIS LINE HERE
        // Reset canvas before drawing starts
        this.resetCanvas(roomId);

        this.io.in(roomId).emit("turnStarted", {
            drawer: session.currentDrawer,
            wordLength: chosenWord.length
        });

        // Start turn timer
        session.timer = setTimeout(() => {
            this.endTurn(roomId);
        }, session.turnTime * 1000);
    }
    onGuess(roomId: string, userId: string, guess: string) {
        const session = this.sessions.get(roomId);
        if (!session || !session.currentWord) return;
        if (userId == session.currentDrawer?.userId) {
            return
        }
        if (session.correctGuesser.has(userId)) {
            return
        }
        if (guess === session.currentWord) {

            session.correctGuesser.add(userId)
            this.updateScore(roomId, userId)
            this.io.in(roomId).emit("correctGuess", { userId })
            const totalGuessers = getUsersInRoom(roomId).length - 1;
            if (session.correctGuesser.size >= totalGuessers) {
                clearTimeout(session.timer);
                this.endTurn(roomId);
            }
        }
        else {
            this.io.in(roomId).emit("chatMessage", { userId, message: guess });
        }
    }


    /**
     * End a drawer's turn
     */
   endTurn(roomId: string) {
    const session = this.sessions.get(roomId);
    if (!session) return;

    session.correctGuesser.clear(); // ← ADD THIS

    this.io.in(roomId).emit("scoresUpdated", {
        scores: Array.from(session.scores.entries())
    });

    this.startRound(roomId);

}   

    broadcastToRoom(roomId: string, event: string, data: any) {
        const users = getUsersInRoom(roomId);
        users.forEach(user => {
            this.io.to(user.socketId).emit(event, data);
        })
    }

    onDisconnect(socketId: string, roomId: string) {
        const session = this.sessions.get(roomId);
        if (!session) return;

        // if the disconnected user was the current drawer, end the turn
        if (session.currentDrawer?.socketId === socketId) {
            clearTimeout(session.timer);
            this.endTurn(roomId);
        }

        // check if only one player left → they are the winner
        const remainingUsers = getUsersInRoom(roomId);
        if (remainingUsers.length === 1) {
            clearTimeout(session.timer);
            this.io.in(roomId).emit("gameEnded", {
                winner: remainingUsers[0].username,
                scores: Array.from(session.scores.entries())
            });
            this.sessions.delete(roomId);
        }

        // if no players left, just clean up
        if (remainingUsers.length === 0) {
            clearTimeout(session.timer);
            this.sessions.delete(roomId);
        }
    }

    createRoom(roomId: string, host: User, difficulty: "easy" | "medium" | "hard" | "normal") {
        createPrivateRoom(roomId, host, 15, difficulty);
        this.createSession(roomId);
    }
    /**
     * End the game completely
     */
    endGame(roomId: string) {
    const session = this.sessions.get(roomId);
    if (!session) return;

    const users = getUsersInRoom(roomId);

    // find winner by highest score
    let winnerId = "";
    let highestScore = 0;
    session.scores.forEach((score, userId) => {
        if (score > highestScore) {
            highestScore = score;
            winnerId = userId;
        }
    });

    // look up winner's username from users list
    const winnerUser = users.find(u => u.userId === winnerId);

    // convert scores map to array with usernames instead of userIds
    const scoresWithUsernames = Array.from(session.scores.entries()).map(([userId, score]) => {
        const user = users.find(u => u.userId === userId);
        return [user?.username ?? userId, score] as [string, number];
    });

    this.io.in(roomId).emit("gameEnded", {
        winner: winnerUser?.username ?? winnerId,
        scores: scoresWithUsernames
    });

    if (session.timer) clearTimeout(session.timer);
    this.sessions.delete(roomId);
}


    saveStroke(roomId: string, strokes: Stroke[]) {
        return saveCanvasState(roomId, strokes);
    }

    /*
     *
     * Get current canvas state
     */
    getCanvas(roomId: string) {
        return getCanvasState(roomId);
    }
    getSession(roomId: string) {
        return this.sessions.get(roomId)
    }
    /**
     * Reset canvas
     */
    resetCanvas(roomId: string) {
        resetCanvasState(roomId);
    }

    /**
     * Update player's score
     */
    updateScore(roomId: string, userId: string) {
        const session = this.sessions.get(roomId);
        if (!session) return;

        const elapsed = Math.floor((Date.now() - session.turnStartedAt) / 1000);
        const rt = Math.max(0, session.turnTime - elapsed); // clamp so rt never goes negative
        const points = Math.round((rt / 60) * 10);

        const prev = session.scores.get(userId) || 0;
        session.scores.set(userId, prev + points);
    }

    /**
     * Get current scores
     */
    getScores(roomId: string) {
        const session = this.sessions.get(roomId);
        return session?.scores;
    }
}
