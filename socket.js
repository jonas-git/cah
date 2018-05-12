const createSocket = require('socket.io');
const configValue = require('./config');
const gameConfig = configValue('Game');

module.exports = function (server) {
  const io = createSocket(server);

  io.on('connection', function (socket) {
    socket.emit('config', gameConfig);
    
    console.log('A user established a connection');

    socket.on('login', function (credentials) {
      console.log('The user logged in with the following credentials:', credentials);
    });
  });
};
