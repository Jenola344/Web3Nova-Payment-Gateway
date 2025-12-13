/**
 * WebSocket Utilities
 * Socket.IO helper functions for real-time communication
 */

/**
 * Emit payment update to specific user
 * @param {Object} io - Socket.IO server instance
 * @param {string} userId - User ID
 * @param {Object} paymentData - Payment data
 */
const emitPaymentUpdate = (io, userId, paymentData) => {
  io.to(`user_${userId}`).emit('payment:update', {
    type: 'payment_update',
    data: paymentData,
    timestamp: new Date().toISOString()
  });
};

/**
 * Emit payment success notification
 * @param {Object} io - Socket.IO server instance
 * @param {string} userId - User ID
 * @param {Object} paymentData - Payment data
 */
const emitPaymentSuccess = (io, userId, paymentData) => {
  io.to(`user_${userId}`).emit('payment:success', {
    type: 'payment_success',
    data: paymentData,
    timestamp: new Date().toISOString()
  });
};

/**
 * Emit payment failure notification
 * @param {Object} io - Socket.IO server instance
 * @param {string} userId - User ID
 * @param {Object} errorData - Error data
 */
const emitPaymentFailure = (io, userId, errorData) => {
  io.to(`user_${userId}`).emit('payment:failure', {
    type: 'payment_failure',
    data: errorData,
    timestamp: new Date().toISOString()
  });
};

/**
 * Emit notification to specific user
 * @param {Object} io - Socket.IO server instance
 * @param {string} userId - User ID
 * @param {Object} notification - Notification data
 */
const emitNotification = (io, userId, notification) => {
  io.to(`user_${userId}`).emit('notification', {
    type: 'notification',
    data: notification,
    timestamp: new Date().toISOString()
  });
};

/**
 * Broadcast admin dashboard update
 * @param {Object} io - Socket.IO server instance
 * @param {Object} dashboardData - Dashboard data
 */
const broadcastDashboardUpdate = (io, dashboardData) => {
  io.to('admin_room').emit('dashboard:update', {
    type: 'dashboard_update',
    data: dashboardData,
    timestamp: new Date().toISOString()
  });
};

/**
 * Emit new payment alert to admins
 * @param {Object} io - Socket.IO server instance
 * @param {Object} paymentData - Payment data
 */
const emitNewPaymentAlert = (io, paymentData) => {
  io.to('admin_room').emit('payment:new', {
    type: 'new_payment',
    data: paymentData,
    timestamp: new Date().toISOString()
  });
};

/**
 * Join user to their personal room
 * @param {Object} socket - Socket instance
 * @param {string} userId - User ID
 */
const joinUserRoom = (socket, userId) => {
  const roomName = `user_${userId}`;
  socket.join(roomName);
  console.log(`User ${userId} joined room: ${roomName}`);
};

/**
 * Join admin to admin room
 * @param {Object} socket - Socket instance
 * @param {string} userId - Admin user ID
 */
const joinAdminRoom = (socket, userId) => {
  socket.join('admin_room');
  console.log(`Admin ${userId} joined admin room`);
};

/**
 * Leave all rooms
 * @param {Object} socket - Socket instance
 */
const leaveAllRooms = (socket) => {
  const rooms = Array.from(socket.rooms).filter(room => room !== socket.id);
  rooms.forEach(room => {
    socket.leave(room);
    console.log(`Socket ${socket.id} left room: ${room}`);
  });
};

/**
 * Get connected users count
 * @param {Object} io - Socket.IO server instance
 * @returns {number}
 */
const getConnectedUsersCount = (io) => {
  return io.sockets.sockets.size;
};

/**
 * Get users in room
 * @param {Object} io - Socket.IO server instance
 * @param {string} roomName - Room name
 * @returns {Array}
 */
const getUsersInRoom = async (io, roomName) => {
  const sockets = await io.in(roomName).fetchSockets();
  return sockets.map(socket => socket.id);
};

/**
 * Disconnect user sockets
 * @param {Object} io - Socket.IO server instance
 * @param {string} userId - User ID
 */
const disconnectUser = async (io, userId) => {
  const roomName = `user_${userId}`;
  const sockets = await io.in(roomName).fetchSockets();
  
  sockets.forEach(socket => {
    socket.disconnect(true);
  });
};

/**
 * Create socket event wrapper with error handling
 * @param {Function} handler - Event handler function
 * @returns {Function}
 */
const socketEventWrapper = (handler) => {
  return async (...args) => {
    try {
      await handler(...args);
    } catch (error) {
      console.error('Socket event error:', error);
      
      // Get callback if it exists (last argument)
      const callback = args[args.length - 1];
      if (typeof callback === 'function') {
        callback({
          success: false,
          error: error.message
        });
      }
    }
  };
};

/**
 * Emit typing indicator
 * @param {Object} socket - Socket instance
 * @param {string} roomName - Room name
 * @param {boolean} isTyping - Typing status
 */
const emitTypingIndicator = (socket, roomName, isTyping) => {
  socket.to(roomName).emit('typing', {
    userId: socket.userId,
    isTyping,
    timestamp: new Date().toISOString()
  });
};

/**
 * Broadcast system message
 * @param {Object} io - Socket.IO server instance
 * @param {string} message - Message to broadcast
 * @param {string} type - Message type
 */
const broadcastSystemMessage = (io, message, type = 'info') => {
  io.emit('system:message', {
    type: 'system_message',
    messageType: type,
    message,
    timestamp: new Date().toISOString()
  });
};

/**
 * Emit real-time analytics update
 * @param {Object} io - Socket.IO server instance
 * @param {Object} analyticsData - Analytics data
 */
const emitAnalyticsUpdate = (io, analyticsData) => {
  io.to('admin_room').emit('analytics:update', {
    type: 'analytics_update',
    data: analyticsData,
    timestamp: new Date().toISOString()
  });
};

/**
 * Acknowledge socket event
 * @param {Function} callback - Callback function
 * @param {boolean} success - Success status
 * @param {*} data - Response data
 */
const acknowledgeEvent = (callback, success, data = null) => {
  if (typeof callback === 'function') {
    callback({
      success,
      data,
      timestamp: new Date().toISOString()
    });
  }
};

module.exports = {
  emitPaymentUpdate,
  emitPaymentSuccess,
  emitPaymentFailure,
  emitNotification,
  broadcastDashboardUpdate,
  emitNewPaymentAlert,
  joinUserRoom,
  joinAdminRoom,
  leaveAllRooms,
  getConnectedUsersCount,
  getUsersInRoom,
  disconnectUser,
  socketEventWrapper,
  emitTypingIndicator,
  broadcastSystemMessage,
  emitAnalyticsUpdate,
  acknowledgeEvent
};