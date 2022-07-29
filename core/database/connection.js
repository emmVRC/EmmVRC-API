const util = require('util');
const mysql = require('mysql');
const Log = require('../logger/Log');
const sleep = require('../sleep');

const config = require('../config');

const params = {
    host: config.database.url,
    user: config.database.user,
    password: config.database.password,
    database: config.database.schema,
    connectTimeout: config.database.timeout,
    connectionLimit: config.database.limit
}

let connectionPool = mysql.createPool(params);

//TODO: add socket for db errors that messages the admins

connectionPool.query = util.promisify(connectionPool.query).bind(connectionPool);
//TODO: REDO PLEASE FOR THE LOVE OF GOD
function attempt(attempt = 1) {
    connectionPool.getConnection((error, connection) => {
        if (error) {
            if (error.code === 'PROTOCOL_CONNECTION_LOST')
                Log.writeError('Database connection was closed. Retry in {0}s', '10');
            else if (error.code === 'ER_CON_COUNT_ERROR')
                Log.writeError('Database has too many connections. Retry in {0}s', '10');
            else if (error.code === 'ECONNREFUSED')
                Log.writeError('Database connection was refused. Retry in {0}s', '10');
            else
                Log.writeError('Database connection error: {0}', error.code);
            connectionPool.retry(attempt)
        }
        if (connection) {
            connection.release()
            Log.writeLog('Database connection successful');
        }
        return;
    });
}

connectionPool.retry = ((attemptCounter) => {
    if (attemptCounter > config.database.maxAttempts) {
        Log.writeLog('Failed to connect after {0} attempts, Aborting...', (attemptCounter - 1));
        return;
    }

    Log.writeLog('Retrying database connection attempt: {0}/{1}', [attemptCounter, config.database.maxAttempts]);

    sleep(config.database.retryTimer).then(() => {
        attempt(++attemptCounter);
    });
});

//TODO Please redo the connection retry like wtf is this shit 
attempt();

module.exports = connectionPool;