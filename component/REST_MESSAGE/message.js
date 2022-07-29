const uuid = require('uuid');

const APIError = require('../../core/APIError');
const Log = require('../../core/logger/Log');
const mysql = require('../../core/database/query');
const authenticationError = require('../../core/authentication/authenticationError');
const authenticationCode = require('../../core/authentication/authenticationCode');
const base64 = require('../../core/util/base64');
const redis = require('../../core/database/redis');

class Message {

    static async get(user_id, channel, sender) {

        let messages = [];
        return messages;
        try {

            if (!await redis.exists(user_id).then((result) => { return result; })) {

                let messageList;
                if (sender != null)
                    messageList = await mysql.q("SELECT rest_message.rest_message_id,\
                            user.user_name AS rest_message_sender_name,\
                            rest_message.rest_message_sender_id,\
                            rest_message.rest_message_body,\
                            rest_message.rest_message_icon,\
                            rest_message.rest_message_created\
                            FROM `rest_message` \
                            LEFT JOIN `user` ON user.user_id = rest_message.rest_message_sender_id\
                            WHERE NOT EXISTS ( SELECT blocked.blocked_blocker_user_id FROM `blocked` WHERE blocked.blocked_target_user_id = rest_message.rest_message_sender_id\
                                 AND blocked.blocked_blocker_user_id = ? )\
                            AND (rest_message.rest_message_recipient_id = ? AND rest_message.rest_message_sender_id = ?) OR rest_message.rest_message_recipient_id = ? AND rest_message.rest_message_sender_id = ? \
                            ORDER BY rest_message.rest_message_created DESC LIMIT 6", [user_id, channel || user_id, sender, sender, user_id]);
                else
                    messageList = await mysql.q("SELECT rest_message.rest_message_id,\
                            user.user_name AS rest_message_sender_name,\
                            rest_message.rest_message_sender_id,\
                            rest_message.rest_message_body,\
                            rest_message.rest_message_icon,\
                            rest_message.rest_message_created\
                            FROM `rest_message` \
                            LEFT JOIN `user` ON user.user_id = rest_message.rest_message_sender_id\
                            WHERE NOT EXISTS ( SELECT blocked.blocked_blocker_user_id FROM `blocked` WHERE blocked.blocked_target_user_id = rest_message.rest_message_sender_id\
                                 AND blocked.blocked_blocker_user_id = ? )\
                            AND rest_message.rest_message_recipient_id = ? AND rest_message.rest_message_read = false \
                            ORDER BY rest_message.rest_message_created", [user_id, channel || user_id]);


                redis.sadd(user_id, "ISCACHED")
                    .then((result) => { })
                    .catch((error) => { throw error });

                messageList.data.records.forEach(element => {
                    redis.sadd(user_id, element.rest_message_id)
                        .then((result) => { return result; })
                        .catch((error) => { throw error });

                    redis.set(element.rest_message_id, element)
                        .then((result) => { return result; })
                        .catch((error) => { throw error });
                });

            }


            const recievedID = await redis.slist(user_id)
                .then((result) => { return result; })
                .catch((error) => { throw error; });
            for (const messageID of recievedID) {

                if (messageID === "ISCACHED") continue;

                messages.push(
                    JSON.parse(await redis.get(messageID)
                        .then((result) => { return result })
                        .catch((error) => { throw error; })
                    )
                );
                // console.log(messages);
            };

            //await mysql.select(["rest_message_id",
            //     "rest_message_body",
            //     "rest_message_icon",
            //     "rest_message_created"], 'rest_message', [['rest_message_recipient_id', '=', channel || user_id], ['rest_message_read', '=', false], ['rest_message_blocked', '=', false]]);

            // if (sender != null)
            //     return await mysql.q("SELECT rest_message.rest_message_id,\
            //                 user.user_name AS rest_message_sender_name,\
            //                 rest_message.rest_message_sender_id,\
            //                 rest_message.rest_message_body,\
            //                 rest_message.rest_message_icon,\
            //                 rest_message.rest_message_created\
            //                 FROM `rest_message` \
            //                 LEFT JOIN `user` ON user.user_id = rest_message.rest_message_sender_id\
            //                 WHERE NOT EXISTS ( SELECT blocked.blocked_blocker_user_id FROM `blocked` WHERE blocked.blocked_target_user_id = rest_message.rest_message_sender_id\
            //                      AND blocked.blocked_blocker_user_id = ? )\
            //                 AND (rest_message.rest_message_recipient_id = ? AND rest_message.rest_message_sender_id = ?) OR rest_message.rest_message_recipient_id = ? AND rest_message.rest_message_sender_id = ? \
            //                 ORDER BY rest_message.rest_message_created DESC LIMIT 6", [user_id, channel || user_id, sender, sender, user_id]);
            // else
            //     return await mysql.q("SELECT rest_message.rest_message_id,\
            //                 user.user_name AS rest_message_sender_name,\
            //                 rest_message.rest_message_sender_id,\
            //                 rest_message.rest_message_body,\
            //                 rest_message.rest_message_icon,\
            //                 rest_message.rest_message_created\
            //                 FROM `rest_message` \
            //                 LEFT JOIN `user` ON user.user_id = rest_message.rest_message_sender_id\
            //                 WHERE NOT EXISTS ( SELECT blocked.blocked_blocker_user_id FROM `blocked` WHERE blocked.blocked_target_user_id = rest_message.rest_message_sender_id\
            //                      AND blocked.blocked_blocker_user_id = ? )\
            //                 AND rest_message.rest_message_recipient_id = ? AND rest_message.rest_message_read = false \
            //                 ORDER BY rest_message.rest_message_created", [user_id, channel || user_id]);

        } catch (error) {
            Log.writeError(error);
            throw new APIError(authenticationCode.internal, authenticationError.internal);
        }
        return messages;
    }

    static async send(user_id, recipient_id, body, icon) {

        if (!recipient_id || !body)
            throw new APIError(authenticationCode.missing, authenticationError.missing);
        return Log.writeError("Messaging is disabled. User " + user_id + " sent body: " + body + ".");

        try {
            // if ((await mysql.count('blocked', ['blocked_target_user_id', '=', recipient_id])) > 0)
            //     return;

            const message = {
                rest_message_id: uuid.v4(),
                rest_message_sender_id: user_id,
		rest_message_sender_name: (await mysql.select('user_name', 'user', ['user_id', '=', user_id])).data.records[0]["user_name"],
                rest_message_recipient_id: recipient_id,
                rest_message_body: base64.encode(body),
                rest_message_icon: icon,
                rest_message_read: false,
                rest_message_created: Math.round((new Date()).getTime() / 1000),
                rest_message_blocked: (await mysql.count('blocked', ['blocked_target_user_id', '=', recipient_id]) ? true : false)
            }

	    if(!message.rest_message_blocked){

            redis.sadd(recipient_id, message.rest_message_id)
                .then((result) => { return result; })
                .catch((error) => { throw error });

            redis.set(message.rest_message_id, message)
                .then((result) => { return result; })
                .catch((error) => { throw error });
	    }

            //this is because i made it auto gen the with the table name so now i cant pass the object in without it yelling
            mysql.insert('rest_message', {
                id: message.rest_message_id,
                sender_id: message.rest_message_sender_id,
                recipient_id: message.rest_message_recipient_id,
                body: message.rest_message_body,
                icon: message.rest_message_icon,
                read: message.rest_message_read,
                created: message.rest_message_created,
                blocked: message.rest_message_blocked,
            });

        } catch (error) {
            Log.writeError(error);
            throw new APIError(authenticationCode.internal, authenticationError.internal);
        }

        return;
    }

    static async read(user_id, message_id) {
        let read_messages = [];
        if (typeof message_id === "object") {
            array.forEach(element => {
                read_messages.push(['rest_message_id', '=', element]);
            });
        } else {
            read_messages = [['rest_message_id', '=', message_id]];
        }
        read_messages.push(['rest_message_recipient_id', '=', user_id]);

        try {
            redis.srem(user_id, message_id)
                .then((result) => { })
                .catch((error) => { throw error; });
            redis.del(message_id)
                .then((result) => { })
                .catch((error) => { throw error; });

            mysql.update('rest_message', { 'read': true }, read_messages);
            return;
        } catch (error) {
            Log.writeError(error);
            throw new APIError(authenticationCode.internal, authenticationError.internal);
        }
    }

}

module.exports = Message;
