const H = require('../../src/helpers');

module.exports = {
    data_types: {
        columns: {
            id: H.uuidKey(),
            str: H.str(10),
            json: H.json(),
            int: H.intBetween(-5, 5),
            float: H.floatBetween(-5, 5),
            uuid: H.uuid(),
            mandatory: H.str(50, true, true),
            date: H.date(),
            uneditable: H.str(50, false)
        }
    }
};
