const PG = require('../src');
const tables = require('./menugen');
const dbConf = {
    user: 'ljkc',
    host: 'localhost',
    database: 'menugen',
    password: 'Sighnomore',
    port: 5432
};

const db = PG.connect({ tables, db: dbConf });
const uuid = require('uuid').v4;

// create the thing we want to delete

let ID = uuid();
console.log('ID');
console.log(ID);

let plan = {
    startdate: '2019-06-03T00:00:00.000Z',
    enddate: '2019-06-06T00:00:00.000Z',
    dietgroups: {
        m: {
            shortName: 'm',
            allergens: [],
            label: 'Meateaters'
        },
        p: {
            shortName: 'p',
            allergens: ['fish'],
            label: 'Pescetarians'
        }
    },
    headcounts: null,
    owner: 'd91aa226-2a13-4f70-be55-76cc4614cd46',
    title: 'Lisa Test AUTO',
    meals: [
        {
            mealtype: 'snack',
            day: 2,
            displayorder: 0,
            headcount_modifier: null,
            courses: null,
            recipe_records: [
                {
                    variantid: 'ae96f4a9-43cf-423c-81dc-9e08c1cb72ba',
                    recipeid: '6d39d9c3-1fb0-439f-92f2-afe1b8768f1d',
                    notes: 'some notes',
                    dietgroups: ['m', 'v'],
                    displayorder: 0
                }
            ]
        }
    ]
};

db.insert('plans', plan, (err, resp) => {
    if (err) {
        console.log(err);
    } else {
        console.log('created');
    }
    // db.deleteById('plans', { id: ID, hard: false, condense: true }, err => {
    //     console.log(err);
    //     console.log('deleted');
    // });
});
