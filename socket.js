const createSocket = require('socket.io');
const configValue = require('./config');

const game = {
  config: configValue('Game')
};

module.exports = function (server) {
  const io = createSocket(server);

  io.on('connection', function (socket) {
    socket.emit('config', game.config);

    socket.on('login', function (credentials) {
      console.log('The user logged in with the following credentials:', credentials);
    });
  });
};
