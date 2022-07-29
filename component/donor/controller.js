const Log = require('../../core/logger/Log')
const donor = require('./donor');

const Donor = ((Donor) => {
    this.Donor = Donor;
})

Donor.get = (async (req, res) => {
    try {
        res.status(200).send(
            await donor.get()
                .then((result) => {
                    return result.data.records;
                })
                .catch((error) => { throw error; })
        );
    } catch (error) {
        Log.writeError(error)
        res.status(error.code).send({ message: error.message });
    }
});

module.exports = Donor;