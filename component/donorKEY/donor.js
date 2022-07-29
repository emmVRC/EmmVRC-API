const APIError = require('../../core/APIError');
const Log = require('../../core/logger/Log');
const mysql = require('../../core/database/query');
const authenticationError = require('../../core/authentication/authenticationError');
const authenticationCode = require('../../core/authentication/authenticationCode');

class Donor {

    static async post() {
        try {
            return await mysql.q("SELECT donor.donor_tooltip, donor.donor_status, donor.donor_user_id, user.user_name as donor_user_name\
            FROM `donor` \
            LEFT JOIN `user` ON user.user_id = donor.donor_user_id");
        } catch (error) {
            Log.writeError(error);
            throw new APIError(authenticationCode.internal, authenticationError.internal);
        }
    }
}

module.exports = Donor;