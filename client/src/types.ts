export interface User {
    socketId: string;
    username: string;
    userId: string;
}

export interface Room {
    id: string;
    users: User[];
    isPublic: boolean;
    maxPlayers: number;
    difficulty: "easy" | "medium" | "hard" | "normal";
}

export interface Stroke {
    userId: string;
    color: string;
    width: number;
    points: Point[];
}

export interface Point {
    x: number;
    y: number;
}