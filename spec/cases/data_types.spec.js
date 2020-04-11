const H = require('../helpers');
const dbConf = require('../configs/data_types.config');
const db = H.getDB(dbConf);
const uuid = require('uuid').v4;

const seedData = [
    {
        id: uuid(),
        mandatory: 'str',
        uneditable: 'str',
        json: { a: 1, b: 2 },
        float: 1.4,
        int: -4,
        str: 'str',
        uuid: uuid()
    }
];

describe('Data Types', function() {

    beforeAll(function(done) {
        H.initialiseDB(dbConf, () => {
            db.insert('data_types', seedData, done);
        });
    });

    it('can insert an object', function(done) {
        const testRow = { id: uuid(), mandatory: 'hello world' };
        db.insert('data_types', testRow, (error, res) => {
            expect(res[0]).toEqual(testRow);
            done();
        });
    });

    it('can retrieve an object', function(done){
        db.retrieve('data_types', { _filter: { id: seedData[0].id } }, (error, res) => {
            expect(res).toEqual(seedData);
            done();
        });
    });
});
