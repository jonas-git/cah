const createSocket = require('socket.io');
const configValue = require('./util/config');
const clientConfig = configValue('Client');

const base62alphabet = '0123456789abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ';
const base62 = require('base-x')(base62alphabet);
const uuidv4 = require('uuid/v4');
const uuidBytes = configValue('Server.uuid_bytes');

const connections = {
  clients: new ClientList(),
  games: {}
};

module.exports = function (server) {
  const io = createSocket(server);

  io.on('connection', function (socket) {
    console.log('new connection');

    const client = new Client(socket);

    // Once a connection is established,
    // immediately send the client configuration.
    socket.emit('config', clientConfig);

    socket.on('login', function (data, callback) {
      const credentials = data.credentials;

      let error = null;
      console.log(data.name, connections.clients.is_name_taken(data.name));
      if (connections.clients.is_name_taken(data.name))
        error = new SocketError('Der Name ist bereits in Verwendung.');
      else {
        client.name = credentials.name;
        connections.clients.push(client);
      }

      callback({
        client: {
          uuid: client.uuid,
          name: client.name
        }
      }, error);
    });

    socket.on('logout', function (data, callback) {
      connections.clients.pop(client);
      callback({}, null);
    });

    socket.on('game_create', function (data, callback) {
      // ...
      callback({}, null);
    });

    socket.on('game_leave', function (data, callback) {
      // ...
      callback({}, null);
    });

    socket.on('rename', function (data, callback) {
      let error = null;
      if (connections.clients.is_name_taken(data.name))
        error = new SocketError('Der Name ist bereits in Verwendung.');
      else
        client.rename(data.name);

      callback({
        name: client.name
      }, error);
    });

    socket.on('disconnect', function () {
      connections.clients.pop(client);
    });
  });
};

/**
 * Create a universally unique identifier.
 * @param {function} checkUUID Callback function for checking if the UUID is ok.
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
 * @param {object} socket Socket.io connection object.
 */
function Client(socket) {
  this.uuid = createUUID(x => !(x in connections.clients));
  this.socket = socket;
  this.name = "";
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

/**
 * Checks if a name already in use.
 * @param {string} name Any name.
 */
ClientList.prototype.is_name_taken = function (name) {
  for (const client in this.list)
    if (client.name === name)
      return true;
  return false;
};

/**
 * Uniformly formatted error object.
 * @param {string} message A detailed error message.
 */
function SocketError(message) {
  this.message = message;
}
