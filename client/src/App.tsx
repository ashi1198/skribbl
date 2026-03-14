import { useState, useEffect } from "react"
import socket from "./Socket"
import { Room, User } from "./types"
import Lobby from "./components/Lobby"
type GameScreen = "lobby" | "waiting" | "playing" | "ended"
function App() {

  const [screen, setScreen] = useState<GameScreen>("lobby")
  const [room, setRoom] = useState<Room | null>(null);
  const [currentUser, setCurrentUser] = useState<User | null>(null)
  const [scores, setScores] = useState<[string, number][]>([]);
  useEffect(() => {
    socket.on("roomJoined", (data:{room:Room}) => {
      setScreen("waiting");
      setRoom(data.room)
    });
    socket.on("roundStarted",()=>{
      setScreen("playing");
    })
    socket.on("gameEnded",(data:{winner:string,scores:[string,number][]})=>{
      setScores(data.scores);
      setScreen("ended");
    })
    return ()=>{
      socket.off("roomJoined");
        socket.off("roundStarted");
        socket.off("gameEnded");
    }

  },[]);
  return (
    <>
      {screen === "lobby" && <Lobby setCurrentUser={setCurrentUser} />}
        {screen === "waiting" && <div>Waiting for host to start...</div>}
        {screen === "playing" && <div>Game screen coming soon</div>}
        {screen === "ended" && <div>Game Over!</div>}
    </>
  )
}

export default App
