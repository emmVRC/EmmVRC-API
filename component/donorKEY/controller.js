const Log = require('../../core/logger/Log')
const donor = require('./donor');

const Donor = ((Donor) => {
    this.Donor = Donor;
})

Donor.add = (async (req, res) => {
    try {
        res.status(200).send({
            status: await donor.add(req.body.user_id, req.body.message)
                .then((result) => { return "OK" })
                .catch((error) => { throw error; })
        });
    } catch (error) {
        Log.writeError(error)
        res.status(error.code).send({ message: error.message });
    }
});

Donor.update = (async (req, res) => {
    try {
        res.status(200).send({

        });
    } catch (error) {

    }
});

module.exports = Donor;