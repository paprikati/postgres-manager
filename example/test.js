const PG = require('../src');
const tables = require('./postgres.config');
const dbConf = {
    user: 'ljkc',
    host: 'localhost',
    database: 'menugen',
    password: 'Sighnomore',
    port: 5432
};


const db = PG.connect({tables, db: dbConf});


db.plans.insert([{id: '19790548-8c6c-11e9-bc42-526af7764f64', title: 'a', owner: '197907f0-8c6c-11e9-bc42-526af7764f64'},
    {id: '1979093a-8c6c-11e9-bc42-526af7764f64', title: 'ab', owner: '19790a66-8c6c-11e9-bc42-526af7764f64'}], ((err, resp) => {
    if (err){
        console.log(err);
    } else {
        console.log('done');
    }
}));
