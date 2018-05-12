const createSocket = require('socket.io');
const configValue = require('./util/config');
const clientConfig = configValue('Client');

const base62alphabet = '0123456789abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ';
const base62 = require('base-x')(base62alphabet);
const uuidv4 = require('uuid/v4');

const state = {
  users: {},
  games: {}
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

/**
 * Create a universally unique identifier.
 * @param {function} checkUUID Callback function for checking if the UUID is ok.
 *        
 */
function createUUID(checkUUID) {
  let uuidB62 = null;
  const buffer = new Buffer(4);
  do {
    const uuid = uuidv4(null, buffer);
    uuidB62 = base62.encode(uuid);
  } while (typeof checkUUID === 'function' && !checkUUID(uuidB62));
  return uuidB62;
}
