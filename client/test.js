import {io} from 'socket.io-client'
const socket= io("https://localhost:5000")
socket.on("connect",()=>{
    console.log("Connected",socket.id);
    socket.emit("joinRoom",{
        roomid:"test123",
        username:"Ashish"
    })
})
