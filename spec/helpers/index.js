const PG = require('../../src');

function initialiseDB(tables, callback){
    const db = getDB(tables);
    db.drop(() => {
        db.initialise(callback);
    });
}

function getDB(tables){
    const dbConf = {
        user: 'postgres',
        host: process.env.DB_HOST,
        database: 'test',
        password: 'abc123',
        port: process.env.DB_PORT
    };

    return PG.connect({ tables, db: dbConf });
}

module.exports = {
    initialiseDB,
    getDB
};
