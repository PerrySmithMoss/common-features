const http = require("http");
const PORT = 5001;
const { Server } = require("socket.io");
const server = http.createServer();

const io = new Server(server, {
  cors: {
    origin: process.env.CLIENT_ORIGIN,
    methods: ["GET", "POST"],
  },
});

const main = async () => {
  io.on("connection", (socket) => {
    console.log(`User ${socket.id} connected `)
    socket.on("disconnect", () => {
      socket.disconnect();
    });

    socket.on("join-room", (room) => {
    console.log(`User joined room ${room}`)
      socket.join(room);
    });

    socket.on("send-message", (room, message) => {
      io.to(room).emit("receive-message", message);
    });
  });

  server.listen(process.env.SERVER_PORT, () =>
    console.log(`🚀  Server running on http://localhost:${process.env.SERVER_PORT}`)
  );
};

main().catch((err) => {
  console.log(err);
});
