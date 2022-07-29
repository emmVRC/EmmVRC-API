// const Log = require('../logger/Log');
// class SocketManager {
//     static log = "123";
//     constructor(server) {
//         this.Log = Log;
//         this.server = server;
//         this.socket = require('./Socket')(server);
//         this.socket.use(require('../authentication').jsonwebtoken.protect)
//         this.connectedClients = [];
//         this.rooms = [];
//         this.index = 0;
//         this.Init(this.socket);
//     }

//     Init(socket) {
//         this.Log.writeLog("Socket listening...");
//         socket.on('connection', ((socket) => {
//             this.OnConnect(socket);
//             this.Load
//             this.OnJoin(socket, "abcd");
//             this.onDisconnect(socket);
//         }));
//     }

//     OnConnect(socket, callback, ...params) {
//         this.Connect(socket);
//         return callback;
//     }

//     onDisconnect(socket, callback) {
//         socket.on('disconnect', (() => {
//             this.Disconnect(socket.id);
//         }));
//         console.log(this.connectedClients);
//         return callback;
//     }

//     OnJoin(socket, room_id) {
//         this.rooms.push(room_id);
//         socket.join(room_id);
//         console.log(this.rooms);
//         console.log(this.socket.sockets.adapter.rooms[room_id]);

//     }

//     Connect(socket) {
//         this.connectedClients.push(socket.id)
//         socket.emit('connected', { message: 'OK' });
//         this.Log.writeLog("connected to socket! ID: {0}", socket.id);
//     }

//     Disconnect(socket_id) {
//         console.log("disconnected", socket_id);

//         const index = this.connectedClients.findIndex((client) => client === socket_id);
//         if (index !== -1)
//             return this.connectedClients.splice(index, 1)[0];
//     }

//     ResolveConnection(socket_id) {
//         return this.connectedClients.findIndex((client) => client === socket_id);
//     }

//     Destroy(socket) {
//     }

//     GetClient(socket_id) {
//         return this.connectedClients.find((client) => client.id === socket_id);
//     }

// }

// module.exports = SocketManager;

// // const Log = require('../logger/Log');
// // const SocketManager = ((server) => {
// //     let Server = this.server;
// //     let connectedClients = [];
// //     let index = 0;
// // });


// // SocketManager.Connect = ((socket) => {
// //     this.connectedClients.push(socket.id)
// //     socket.emit('connected', { message: 'OK' });
// //     this.Log.writeLog("connected to socket! ID: {0}", socket.id);
// // });

// // SocketManager.OnConnect = ((socket, callback) => {
// //     this.Connect(socket);
// //     return callback;
// // });

// // SocketManager.Disconnect = ((socket_id) => {
// //     const index = this.connectedClients.findIndex((client) => client === socket_id);
// //     if (index !== -1)
// //         return this.connectedClients.splice(index, 1)[0];
// // })

// // SocketManager.onDisconnect = ((socket, callback) => {
// //     socket.on('disconnect', (() => {
// //         this.Disconnect(socket.id);
// //     }));
// //     console.log(this.connectedClients);
// //     return callback;
// // });


// // SocketManager.Init = ((socket) => {
// //     Log.writeLog("Socket listening...");
// //     socket.on('connection', ((socket) => {
// //         this.OnConnect(socket);
// //         this.Load
// //         this.onDisconnect(socket);
// //     }));
// // });


// // SocketManager.ResolveConnection = ((socket_id) => {
// //     return SocketManager.connectedClients.findIndex((client) => client === socket_id);
// // });

// // SocketManager.Destroy = ((socket) => {

// // });

// // SocketManager.GetClient = ((socket_id) => {
// //     return this.connectedClients.find((client) => client.id === socket_id);
// // });

// // module.exports = SocketManager;