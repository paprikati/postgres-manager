const DB = require('./db');

function initialise(config){
    return new DB(config);
}

module.exports = {
    initialise
    // checkSchema,
    // fixSchema, // modes 'hard' including deletes and 'soft' with no deletion
};
