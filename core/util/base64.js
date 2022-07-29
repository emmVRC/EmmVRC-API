const base64 = (() => { });

base64.encode = ((string) => {
    try {
        return Buffer.from(string).toString('base64');
    } catch (error) {
        return
    }
});

base64.decode = ((string) => {
    try {
        return Buffer.from(string, 'base64').toString('utf8');
    } catch (error) {
        return
    }
});

module.exports = base64;