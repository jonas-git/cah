const createSocket = require('socket.io');
const debug = require('debug')('cah:server');

module.exports = function (server) {
  const io = createSocket(server);

  io.on('connection', function (socket) {
    console.log('A user established a connection');

    socket.on('login', function (credentials) {
      console.log('The user logged in with the following credentials:', credentials);
    });
  });
};
