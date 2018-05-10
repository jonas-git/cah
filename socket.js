const createSocket = require('socket.io');



module.exports = function (server) {
    const io = createSocket(server);

    io.on('connection', function (socket) {
        console.log('a user established a connection');
        socket.on('login', function (credentials) {
            console.log('the user logged in with the following credentials:', credentials);
        });
    });
};
