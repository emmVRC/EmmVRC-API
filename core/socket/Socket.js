const protected = require('../../component/protected.sockets');
const keyed = require('../../component/keyed.sockets');
const debug = require('../../component/debug/socket');
const { isObject } = require('lodash');



const Socket = ((server) => {

    let socket = require('socket.io')(server);
    socket.set('transports', ['websocket']);

    socket.use((socket, next) => {
        require('../')
    });

    Set = ((server) => {
        socket = server
    });

    Instance = (() => {
        return socket;
    });

    socket.on('connection', ((sock) => {
        console.log("here");
        sock.on('disconnect', () => {

        });
    }));

    socket.on('message')

});

module.exports = Socket