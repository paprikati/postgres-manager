const DB = require('./db');

function connect(config){
    return new DB(config);
}

module.exports = {
    connect
    // checkSchema,
    // fixSchema, // modes 'hard' including deletes and 'soft' with no deletion
};
