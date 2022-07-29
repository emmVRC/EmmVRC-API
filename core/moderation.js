const { v4: uuid } = require('uuid');
const mysql = require('./database/query');
const Log = require('./logger/Log');

class Moderation {
  static async createBan(userId, targetAddress, issuerId, banMessage, expireDate) {
    let newBanUuid = uuid();

    await mysql.q("INSERT INTO ban (ban_id, ban_user_id, ban_issuer_user_id, ban_message, ban_address, ban_expire_date) VALUES (?, ?, ?, ?, ?, ?)",
      [
        newBanUuid,
        userId,
        issuerId,
        banMessage,
        targetAddress,
        expireDate
      ]);
  }

  static async getBans(userId, address) {
    let returnVal = null;

    try {
      if (userId && address) {
        returnVal = await mysql.q(
          "SELECT ban_id, ban_message, ban_expire_date, ban_created_date FROM ban WHERE (ban_user_id = ? OR ban_address = ?)\
           AND (ban_expire_date >= NOW() OR ban_expire_date IS NULL)", [userId, address]);
      } else if (userId) {
        returnVal = await mysql.q(
          "SELECT ban_id, ban_message, ban_expire_date, ban_created_date FROM ban WHERE ban_user_id = ? \
          AND (ban_expire_date >= NOW() OR ban_expire_date IS NULL)", [userId]);
      } else if (address) {
        returnVal = await mysql.q(
          "SELECT ban_id, ban_message, ban_expire_date, ban_created_date FROM ban WHERE ban_address = ? \
          AND (ban_expire_date >= NOW() OR ban_expire_date IS NULL)", [address]);
      }
    } catch (err) {
      Log.writeError("Failed to query bans: " + err);
    }

    return returnVal?.data?.records;
  }
}

module.exports = Moderation;