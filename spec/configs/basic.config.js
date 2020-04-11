const H = require('../../src/helpers');

module.exports = {
    people: {
        columns: {
            id: H.uuidKey(),
            name: H.str(20)
        }
    }
};
