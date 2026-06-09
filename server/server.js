import http from "http";
import dotenv from "dotenv";

import { Server }
from "socket.io";

import app from "./app.js";
import connectDB from "./config/db.js";
import { setIo } from "./config/socket.js";

dotenv.config();
await connectDB();

const PORT =
  process.env.PORT || 5000;

const server =
  http.createServer(app);

export const io = new Server(
  server,
  {
    cors: {
      origin:
        "http://localhost:5173",
      methods: [
        "GET",
        "POST",
        "PATCH",
      ],
    },
  }
);

setIo(io);

io.on("connection", (socket) => {
  console.log(
    "User Connected:",
    socket.id
  );

  socket.on("joinRoom", (userId) => {
    socket.join(userId);

    console.log(
      `User joined room: ${userId}`
    );
  });

  socket.on("disconnect", () => {
    console.log(
      "User Disconnected:",
      socket.id
    );
  });
});

server.listen(PORT, () => {
  console.log(
    `Server running on port ${PORT}`
  );
});
