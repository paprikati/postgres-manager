const PG = require('../src');
const tables = require('./postgres.config');
const dbConf = {
    user: 'ljkc',
    host: 'localhost',
    database: 'menugen',
    password: 'Sighnomore',
    port: 5432
};

const db = PG.connect({ tables, db: dbConf });

// const meals1 = [
//     {id: 'aa790548-8c6c-11e9-bc42-526af7764f00', mealtype: 'dinner', planid: '19790548-8c6c-11e9-bc42-526af7764f64'},
//     {id: 'aa790548-8c6c-11e9-bc42-526af7764f02', mealtype: 'lunch', planid: '19790548-8c6c-11e9-bc42-526af7764f64'}
// ];
// const meals2 = [
//     {id: 'aa790548-8c6c-11e9-bc42-526af7764f61', mealtype: 'breakfast', planid: '1979093a-8c6c-11e9-bc42-526af7764f64'},
//     {id: 'aa790548-8c6c-11e9-bc42-526af7764f62', mealtype: 'lunch', planid: '1979093a-8c6c-11e9-bc42-526af7764f64'}
// ];
// columns: ['id', 'mealtype'], filters: [['mealtype', 'dinner']]

// db.updateById('plans', {id: '19790548-8c6c-11e9-bc42-526af7764f64', title: 'nomeals2', meals: meals1}, (err, res) => {
//     console.log('done');
//     console.log(res);
//     process.exit();
// });

// db.insert('plans', {id: '19790548-8c6c-11e9-bc42-526af7764f60', title: 'nomeals', owner: '197907f0-8c6c-11e9-bc42-526af7764f64'}, (err, resp) => {
//     if (err){
//         console.log(err);
//     } else {
//         console.log('done');
//     }
// });

// db.get('plans', {columns: ['id', 'meals'], subColumns: {meals: ['mealtype']}}, (err, resp) => {
//     console.log('done');
//     if (err){
//         // console.log(err);
//     } else if (resp){
//         // console.log(resp);
//         console.log(resp);
//     }
//     process.exit();
// });
// var a = 'mealtype';
// db.get('meals', {filter: `${a} = 'dinner'`}, (err, resp) => {
//     console.log('done');
//     console.log(resp);
//     if (err){
//         // console.log(err);
//     } else if (resp){
//     }
// });

// db.insert('plans', [{id: '19790548-8c6c-11e9-bc42-526af7764f64', title: 'a', owner: '197907f0-8c6c-11e9-bc42-526af7764f64', meals: meals1},
//     {id: '1979093a-8c6c-11e9-bc42-526af7764f64', title: 'ab', owner: '19790a66-8c6c-11e9-bc42-526af7764f64', meals: meals2}], ((err, resp) => {
//     if (err){
//         console.log('error');
//         console.log(err);
//     } else {
//         console.log('done');
//     }
// }));

const getTree = s => {
    return {
        id: s + 1,
        name: 'PARENT1',
        children: [
            { id: s + 2, name: 'CHILD1', gender: null },
            {
                id: s + 3,
                name: 'CHILD2',
                gender: true,
                grandchildren: [
                    { id: s + 4, name: 'GCHILD2.1' },
                    { id: s + 5, name: 'GCHILD2.2' }
                ]
            },
            {
                id: s + 6,
                name: 'CHILD3',
                gender: false,
                grandchildren: [
                    { id: s + 7, name: 'GCHILD3.1' },
                    { id: s + 8, name: 'GCHILD3.2' }
                ]
            }
        ]
    };
};

const callback = (err, resp) => {
    if (err) {
        console.log(err);
    } else {
        console.log(resp);
        console.log(resp[0]);
    }
    process.exit();
};

console.log('hello');

db.insert(
    'parents',
    [{ name: 'hi', children: [{ name: 'kid1' }, { name: 'kid2' }] }],
    callback
);

// db.insert('parents', getTree(70), callback);
// db.insert('children', [{id: 23, name: 'control', parentid: 1000, testarr: ['a', 'b', 'c']}], callback);
// db.delete('parents', {_filter: {id: 51}}, callback);

// db.deleteById('grandchildren', {ids: [74, 75]}, callback);

// db.updateById('parents', data, callback);
// db.delete('children', {hard: false, filters: [['id', 3]]}, callback);
// db.updateById('parents', data, (err, resp) => {
//     if (err){
//         console.log(err);
//     } else {
//         console.log(resp);
//     }
//     process.exit();
// });

// var a = db.test('children', [['id', [1, 2, 3]]]);
// console.log(a);
// var b = db.test('parents', [['id', [1, 2, 3]]]);
// console.log(b);

// db.get('children', {filters: [['id', [1, 2, 3]]]}, (err, resp) => {
//     if (err){
//         console.log(err);
//     } else {
//         console.log(resp);
//     }
//     process.exit();
// });
