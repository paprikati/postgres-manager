const DB = require('./db');
const helpers = require('./helpers');

function connect(config) {
    return new DB(config);
}

module.exports = {
    connect,
    helpers
    // checkSchema,
    // fixSchema, // modes 'hard' including deletes and 'soft' with no deletion
};
