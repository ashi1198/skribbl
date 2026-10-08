export interface User {
  socketId: string;
  username: string;
  userId: string;
}
export interface Room {
  id: string;
  users: User[];
  canvasState?: CanvasState;
  isPublic: boolean;
  maxPlayers: number;
  difficulty: "easy" | "medium" | "hard" | "normal";
  rounds?: number; // ← add
  turnTime?: number; // ← add
}

// * ** ** * * ***start of the canvas interface **********************||
export interface CanvasState {
  strokes: Stroke[]; // all the strokes drawn on the canvas
  backgroundColor?: string; // optional canvas background
}

export interface Stroke {
  userId: string; // who drew it
  color: string; // color of the stroke
  width: number; // stroke thickness
  points: Point[]; // array of points in the stroke
}

export interface Point {
  x: number;
  y: number;
}
//|| ******************end of the canvasstate interface *********************************||
