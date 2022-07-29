const APIError = require('../../core/APIError');
const Log = require('../../core/logger/Log');
const mysql = require('../../core/database/query');
const authenticationError = require('../../core/authentication/authenticationError');
const authenticationCode = require('../../core/authentication/authenticationCode');

class Message {

    static async list(user_id) {
        try {
            return await mysql.get("")
        } catch (error) {

        }
    }

    static async get(thread_id, requestor_user_id) {
        try {
            //add select fro thread and where user id = your id
            const columns = ["message.message_id", "message.message_thread_id", "message.message_body", "message.message_icon", "message.message_created_date", "user.user_name"]
            return await mysql.q("SELECT ? FROM message WHERE message.message_id = ? ", [columns, thread_id]);
        } catch (error) {
            Log.writeError(error);
            throw new APIError(authenticationCode.internal, authenticationError.internal);
        }
    }

    static async send(thread_id, sender_user_id, subject, body, icon) {
        if (!thread_id || !sender_user_id || !subject || !body || !icon)
            throw new APIError(authenticationCode.missing, authenticationError.missing);
        return Log.writeError("Messages are currently disabled. User sent: "+body+" as the body.");

        try {
            return await mysql.insert('message', {
                thread_id,
                sender_user_id,
                subject,
                body,
                icon
            });
        } catch (error) {
            Log.writeError(error);
            throw new APIError(authenticationCode.internal, authenticationError.internal);
        }
    }

    static async register(user_id) {
        if (typeof user_id != "object")
            throw new APIError(authenticationCode.missing, authenticationError.missing);

        try {
            //Check if thread already exists
            //get the all threads by the first user and check if all other users share the a thread id
            let existing = await mysql.select()
            return await mysql.insert
        } catch (error) {

        }
    }

}

module.exports = Message;
