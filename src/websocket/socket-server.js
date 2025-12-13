const socketIO = require('socket.io');
const { verifyAccessToken } = require('../utils/auth-utils');
const { joinUserRoom, joinAdminRoom, leaveAllRooms } = require('../utils/socket-utils');
const logger = require('../config/logger-config');
const config = require('../config/env-config');

let io;

const initializeSocketServer = (server) => {
  io = socketIO(server, {
    cors: {
      origin: config.cors.origin,
      credentials: true
    },
    pingTimeout: 60000,
    pingInterval: 25000
  });
  
  // Authentication middleware
  io.use(async (socket, next) => {
    try {
      const token = socket.handshake.auth.token;
      
      if (!token) {
        return next(new Error('Authentication token required'));
      }
      
      const decoded = verifyAccessToken(token);
      socket.userId = decoded.id;
      socket.userRole = decoded.role;
      
      next();
    } catch (error) {
      next(new Error('Invalid authentication token'));
    }
  });
  
  // Connection handler
  io.on('connection', (socket) => {
    logger.info('WebSocket client connected', {
      socketId: socket.id,
      userId: socket.userId
    });
    
    // Join user's personal room
    joinUserRoom(socket, socket.userId);
    
    // Join admin room if admin
    if (['admin', 'super_admin'].includes(socket.userRole)) {
      joinAdminRoom(socket, socket.userId);
    }
    
    // Handle disconnection
    socket.on('disconnect', (reason) => {
      logger.info('WebSocket client disconnected', {
        socketId: socket.id,
        userId: socket.userId,
        reason
      });
      leaveAllRooms(socket);
    });
    
    // Handle errors
    socket.on('error', (error) => {
      logger.error('WebSocket error', {
        socketId: socket.id,
        userId: socket.userId,
        error: error.message
      });
    });
  });
  
  logger.info('WebSocket server initialized');
  return io;
};

const getIO = () => {
  if (!io) {
    throw new Error('Socket.IO not initialized');
  }
  return io;
};

module.exports = { initializeSocketServer, getIO };
