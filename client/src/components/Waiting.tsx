import type { Room, User } from "../types";
interface waitingProps {
  room: Room | null;
  currentUser: User | null;
}
export function Waiting({ room, currentUser }: waitingProps) {
  return <></>;
}
