const events = ((io) => {
    io.on('/rooms')

    io.on('disconnect', require('./events/disconnect'));
});

module.exports = events;