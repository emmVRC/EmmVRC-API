const crypto = require('crypto');

const Crypt = ((crypt) => {
    this.crypt = crypt;
});


Crypt.hash = (async (obj, salt = '') => {
    const hash = crypto.createHmac('sha256', salt);
    hash.update(obj);
    return {
        salt: salt,
        hash: hash.digest('hex')
    }
});

Crypt.bytes = (async (length = 48) => {
    return new Promise((resolve, reject) => {
        crypto.randomBytes(length, function (error, buffer) {
            if (error) reject("error creating buffer");
            resolve(buffer.toString('hex'));
        });
    });
});

module.exports = Crypt;