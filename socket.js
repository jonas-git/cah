const createSocket = require('socket.io');
const configValue = require('./config');
const clientConfig = configValue('Client');

const state = {
  users: [],
  games: [],
};

module.exports = function (server) {
  const io = createSocket(server);

  io.on('connection', function (socket) {
    // Once a connection is established,
    // immediately send the client configuration.
    socket.emit('config', clientConfig);
    
    socket.on('login', function (credentials) {
      console.log('The user logged in with the following credentials:', credentials);
    });
  });
};
