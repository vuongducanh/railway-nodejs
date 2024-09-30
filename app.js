const express = require('express');
const path = require('path');
const indexRouter = require('./routes/index');
const http = require("http");
const app = express();
const server = http.createServer(app);
const { Server } = require("socket.io");
const io = new Server(server, {
  cors: {
    origin: "*", // Cho phép tất cả các domain
    methods: ["GET", "POST"],
    credentials: false // Nếu bạn cần hỗ trợ cookie
  }
});

const PORT = 3000;

// Serve static files from the "public" directory
app.use(express.static(path.join(__dirname, 'public')));

io.on("connection", function (socket) {
  io.sockets.emit(
    "user-joined",
    socket.id,
    io.engine.clientsCount,
    Object.keys(io.sockets.clients().sockets)
  );

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

app.listen(PORT, () => {
  console.log(`Server running at http://localhost:${PORT}/`);
});
