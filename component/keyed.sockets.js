const socket = require('../core/socket');
module.exports = () => {

    socket.Instance().on('abc', (() => { }))

}