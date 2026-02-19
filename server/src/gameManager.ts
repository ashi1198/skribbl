// gameManager.ts
import { Room, User, Stroke } from "./types";
import { getUsersInRoom, saveCanvasState, getCanvasState, resetCanvasState } from "./room";
import { getRandomWord, WordCategory } from "./words";

// Interface for a single game session
interface GameSession {
  roomId: string;
  currentDrawer: User | null;
  currentWord: string | null;
  usedWords: Set<string>;
  roundNumber: number;
  scores: Map<string, number>; // userId -> score
  timer?: NodeJS.Timeout;
  turnTime: number; // e.g., seconds per turn
}

// Main GameManager class
export class GameManager {
  private sessions: Map<string, GameSession>;

  constructor() {
    this.sessions = new Map();
  }

  /**
   * Create a new game session for a room
   */
  createSession(roomId: string, turnTime = 60) {
    const session: GameSession = {
      roomId,
      currentDrawer: null,
      currentWord: null,
      usedWords: new Set(),
      roundNumber: 0,
      scores: new Map(),
      turnTime,
    };
    this.sessions.set(roomId, session);
    return session;
  }

  /**
   * Start a new round in a game
   */
  startRound(roomId: string) {
    const session = this.sessions.get(roomId);
    if (!session) {
      console.error("No active session for room", roomId);
      return;
    }

    // TODO:
    // 1. Pick a drawer (round-robin from users)
    // 2. Pick a word based on room difficulty
    // 3. Reset the canvas for this round
    // 4. Notify all users who is drawing and the word options
    // 5. Start turn timer
  }

  /**
   * End the current round
   */
  endRound(roomId: string) {
    const session = this.sessions.get(roomId);
    if (!session) return;

    // TODO:
    // 1. Calculate scores
    // 2. Update session data
    // 3. Notify users of round results
  }

  /**
   * End the game completely
   */
  endGame(roomId: string) {
    const session = this.sessions.get(roomId);
    if (!session) return;

    // TODO:
    // 1. Notify users that game ended
    // 2. Cleanup session
    this.sessions.delete(roomId);
  }

  /**
   * Record strokes drawn by the current drawer
   */
  saveStroke(roomId: string, strokes: Stroke[]) {
    // Calls saveCanvasState from room.ts
    return saveCanvasState(roomId, strokes);
  }

  /**
   * Get the current canvas state for a room
   */
  getCanvas(roomId: string) {
    return getCanvasState(roomId);
  }

  /**
   * Reset the canvas (e.g., at the start of a round)
   */
  resetCanvas(roomId: string) {
    resetCanvasState(roomId);
  }

  /**
   * Get or update scores
   */
  updateScore(roomId: string, userId: string, points: number) {
    const session = this.sessions.get(roomId);
    if (!session) return;
    const prev = session.scores.get(userId) || 0;
    session.scores.set(userId, prev + points);
  }

  /**
   * Get current scores for a room
   */
  getScores(roomId: string) {
    const session = this.sessions.get(roomId);
    return session?.scores;
  }
}
