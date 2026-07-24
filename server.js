const http = require('node:http');
const { Server } = require('socket.io');

const port = process.env.PORT || 3000;
const allowedOrigins = process.env.CORS_ORIGIN
  ? process.env.CORS_ORIGIN.split(',').map((origin) => origin.trim())
  : '*';

let eventState = { state: 1, activeOrbs: [], count: 10, showcase: 0 };

const server = http.createServer();
const io = new Server(server, {
  cors: { origin: allowedOrigins, methods: ['GET', 'POST'] }
});

io.on('connection', (socket) => {
  socket.emit('event-state', eventState);
  socket.on('event-state', (nextState) => {
    if (!nextState || ![1, 2, 3].includes(Number(nextState.state))) return;
    eventState = {
      state: Number(nextState.state),
      activeOrbs: Array.isArray(nextState.activeOrbs) ? nextState.activeOrbs : [],
      count: Number.isFinite(nextState.count) ? nextState.count : 10,
      showcase: Number.isFinite(nextState.showcase) ? nextState.showcase : 0
    };
    io.emit('event-state', eventState);
  });
});

server.listen(port, () => console.log(`Socket server is listening on port ${port}`));
