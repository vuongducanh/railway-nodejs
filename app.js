const express = require('express');
const path = require('path');
const indexRouter = require('./routes/index');
const app = express();
const cors = require("cors");

const http = require('http');
const server = http.createServer(app);
const { Server } = require("socket.io");
app.use(cors({
  origin: "*", // Cho phép tất cả các domain
  methods: ["GET", "POST"],
  credentials: false // Để sử dụng cookie, hãy thay đổi thành true
}));

const io = new Server(server, {
  cors: {
    origin: "*", // Cho phép tất cả các domain
    methods: ["GET", "POST"]
  }
});

const PORT = 3000;

// Serve static files from the "public" directory
app.use(express.static(path.join(__dirname, 'public')));

io.on("connection", function (socket) {
  io.emit("user-joined", {
    id: socket.id,
    count: io.engine.clientsCount,
    clients: Array.from(io.sockets.sockets.keys()), // Lấy danh sách ID socket
  });

  socket.on("signal", (toId, message) => {
    io.to(toId).emit("signal", socket.id, message);
  });

  socket.on("message", function (data) {
    io.sockets.emit("broadcast-message", socket.id, data);
  });

  socket.on("disconnect", function () {
    io.sockets.emit("user-left", socket.id);
  });
});


// Use the router for handling routes
app.use('/', indexRouter);

// Catch-all route for handling 404 errors
app.use((req, res, next) => {
    res.status(404).sendFile(path.join(__dirname, 'views', '404.html'));
  });

server.listen(PORT, () => {
  console.log(`Server running at http://localhost:${PORT}/`);
});
