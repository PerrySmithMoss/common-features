import "./App.css";
import { io } from "socket.io-client";
import { useEffect, useState } from "react";

const socket = io.connect(process.env.SOCKET_URL);

function App() {
  const [room, setRoom] = useState("");
  const [message, setMessage] = useState("");
  const [messageReceived, setMessageReceived] = useState("");

  const joinRoom = () => {
    if (room !== "") {
      socket.emit("join-room", room);
    }
  };

  const sendMessage = () => {
    setMessage("")
    socket.emit("send-message", room, message);
  };

  useEffect(() => {
    socket.on("receive-message", (message) => {
      setMessageReceived(message);
    });
  }, [socket]);

  return (
    <div className="App">
      <input
        placeholder="Room Number..."
        onChange={(event) => {
          setRoom(event.target.value);
        }}
      />
      <button onClick={joinRoom}> Join Room</button>
      <input
        placeholder="Message..."
        onChange={(event) => {
          setMessage(event.target.value);
        }}
      />
      <button onClick={sendMessage}> Send Message</button>
      <h1> Message:</h1>
      {messageReceived}
    </div>
  );
}

export default App;
