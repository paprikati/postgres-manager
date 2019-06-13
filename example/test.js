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

const meals1 = [
    {id: 'aa790548-8c6c-11e9-bc42-526af7764f00', mealtype: 'dinner', planid: '19790548-8c6c-11e9-bc42-526af7764f64'},
    {id: 'aa790548-8c6c-11e9-bc42-526af7764f01', mealtype: 'snack', planid: '19790548-8c6c-11e9-bc42-526af7764f64'}
];
const meals2 = [
    {id: 'aa790548-8c6c-11e9-bc42-526af7764f61', mealtype: 'breakfast', planid: '1979093a-8c6c-11e9-bc42-526af7764f64'},
    {id: 'aa790548-8c6c-11e9-bc42-526af7764f62', mealtype: 'lunch', planid: '1979093a-8c6c-11e9-bc42-526af7764f64'}
];
// columns: ['id', 'mealtype'], filters: [['mealtype', 'dinner']]
db.get('meals', {}, (err, resp) => {
    console.log('done');
    if (err){
        console.log(err);
    } else if (resp){
        console.log(resp.rows);

    }
});

// db.insert('plans', [{id: '19790548-8c6c-11e9-bc42-526af7764f64', title: 'a', owner: '197907f0-8c6c-11e9-bc42-526af7764f64', meals: meals1},
//     {id: '1979093a-8c6c-11e9-bc42-526af7764f64', title: 'ab', owner: '19790a66-8c6c-11e9-bc42-526af7764f64', meals: meals2}], ((err, resp) => {
//     if (err){
//         console.log('error');
//         console.log(err);
//     } else {
//         console.log('done');
//     }
// }));
