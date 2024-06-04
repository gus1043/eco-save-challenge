const SocketIO = require('socket.io');

module.exports = (server, app) => {
    const io = SocketIO(server, { path: '/socket.io' });
    app.set('io', io);

    io.on('connection', (socket) => {
        console.log('유저가 들어왔다');

        socket.on('disconnect', () => {
            console.log('유저 나갔다');
        });

        socket.on('chat-msg', (msg) => {
            io.emit('chat-msg', msg);
        });
    });
};
