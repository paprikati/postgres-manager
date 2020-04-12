const H = require('../../src/helpers');

module.exports = {
    people: {
        columns: {
            id: H.uuidKey(),
            name: { ...H.str(20), validator: x => x != 'banned' }
        },
        generateUUID: true,
        mapOnRetrieve: row => {
            row.extraProp = true;
            return row;
        },
        sortBy: 'name'
    }
};
