interface User {
    socketId: string;
    username: string;
    userId: string;
}
interface Room {
    id: string; // unique identifier for the room
    users: User[];
    canvasState?: CanvasState;
    isPublic: boolean; // true if anyone can join else its a custom room
    maxPlayers: number;
    
}

// * ** ** * * ***start of the canvas interface **********************||
interface CanvasState {
    strokes: Stroke[];       // all the strokes drawn on the canvas
    backgroundColor?: string; // optional canvas background
}

interface Stroke {
    
    userId: string;          // who drew it
    color: string;           // color of the stroke
    width: number;           // stroke thickness
    points: Point[];         // array of points in the stroke
}

interface Point {
    x: number;
    y: number;
}
//|| ******************end of the canvasstate interface *********************************||
