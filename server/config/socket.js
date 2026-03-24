const http = require('http');
const { Server } = require('socket.io');

let io;

const initSocket = (server) => {
  io = new Server(server, {
    cors: {
      origin: process.env.CLIENT_URL || 'http://localhost:5173',
      methods: ['GET', 'POST'],
    },
  });

  io.on('connection', (socket) => {
    console.log(`User connected: ${socket.id}`);

    socket.on('join:warehouse', ({ warehouseId }) => {
      socket.join(`warehouse_${warehouseId}`);
      console.log(`User ${socket.id} joined warehouse_${warehouseId}`);
    });

    socket.on('leave:warehouse', ({ warehouseId }) => {
      socket.leave(`warehouse_${warehouseId}`);
      console.log(`User ${socket.id} left warehouse_${warehouseId}`);
    });

    socket.on('disconnect', () => {
      console.log(`User disconnected: ${socket.id}`);
    });
  });

  return io;
};

const getIO = () => {
  if (!io) {
    throw new Error('Socket.io not initialized');
  }
  return io;
};

module.exports = { initSocket, getIO };
