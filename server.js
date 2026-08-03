const http = require('node:http');
const { Server } = require('socket.io');

const port = process.env.PORT || 3000;
const allowedOrigins = process.env.CORS_ORIGIN
  ? process.env.CORS_ORIGIN.split(',').map((origin) => origin.trim())
  : '*';

let eventState = { state: 1, activeOrbs: [], count: 10, showcase: 0, touchRowY: 62, touchPoints: [{ id: 1, x: 14, y: 84 }, { id: 2, x: 27, y: 84 }, { id: 3, x: 40, y: 84 }, { id: 4, x: 53, y: 84 }, { id: 5, x: 66, y: 84 }, { id: 6, x: 79, y: 84 }, { id: 7, x: 92, y: 84 }] };

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
      showcase: Number.isFinite(nextState.showcase) ? nextState.showcase : 0,
      touchRowY: Number.isFinite(nextState.touchRowY) ? Math.max(0, Math.min(100, nextState.touchRowY)) : eventState.touchRowY,
      touchPoints: Array.isArray(nextState.touchPoints) ? nextState.touchPoints.map((point) => ({ id: Number(point.id), x: Number(point.x), y: Number(point.y) })).filter((point) => Number.isFinite(point.id) && Number.isFinite(point.x) && Number.isFinite(point.y)) : eventState.touchPoints
    };
    io.emit('event-state', eventState);
  });
});

server.listen(port, () => console.log(`Socket server is listening on port ${port}`));
