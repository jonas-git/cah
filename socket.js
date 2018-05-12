const createSocket = require('socket.io');
const configValue = require('./util/config');
const clientConfig = configValue('Client');

const base62alphabet = '0123456789abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ';
const base62 = require('base-x')(base62alphabet);
const uuidv4 = require('uuid/v4');
const uuidBytes = configValue('uuid_bytes');

const connections = {
  clients: {},
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
  const buffer = new Buffer(uuidBytes);
  do {
    const uuid = uuidv4(null, buffer);
    uuidB62 = base62.encode(uuid);
  } while (typeof checkUUID === 'function' && !checkUUID(uuidB62));
  return uuidB62;
}

/**
 * A client that connected to the socket.
 * @param {string} name Name of the client.
 * @param {object} socket Socket.io connection object.
 */
function Client(name, socket) {
  this.uuid = createUUID(x => !(x in connections.clients));
  this.name = name;
  this.socket = socket;
}

/**
 * Change the name of the client.
 * @param {string} newName New name of the client.
 */
Client.prototype.rename = function (newName) {
  this.name = newName;
};

/**
 * Data structure to keep track of all connected clients.
 */
function ClientList() {
  this.list = {};
}

/**
 * Add a client to the list.
 * @param {Client} client Any client.
 */
ClientList.prototype.push = function (client) {
  this.list[client.uuid] = client;
};

/**
 * Remove a client from the list.
 * @param {Client} client A client that is present in the list.
 */
ClientList.prototype.pop = function (client) {
  delete this.list[client.uuid];
}

/**
 * Find a client in the list by its UUID.
 * @param {string} uuid UUID of a client.
 */
ClientList.prototype.find = function (uuid) {
  return uuid in this.list ? this.list[uuid] : undefined;
}
