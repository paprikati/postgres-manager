const H = require('../helpers');
const dbConf = require('../configs/data_types.config');
const db = H.getDB(dbConf);
const uuid = require('uuid').v4;

const seedId = uuid();
const seedData = [
    {
        id: seedId,
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
        H.initialiseDB(dbConf, done);
    });

    beforeEach(function(done){
        db.reset(() => {
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
        db.retrieve('data_types', { _filter: { id: seedId } }, (error, res) => {
            expect(res).toEqual(seedData);
            done();
        });
    });

    describe('strings', function(){

        it('validates type', function(done){
            db.insert('data_types', { id: uuid(), mandatory: 'hi', str: false }, err => {
                expect(err.message).toBe('false is not a string for column str');
                done();
            });
        });

        it('validates length', function(done){
            db.insert('data_types', { id: uuid(), mandatory: 'hi', str: 'abc-abc-abc-abc' }, err => {
                expect(err.message).toBe('String abc-abc-abc-abc exceeds length limit 10 for column str');
                done();
            });
        });
    });
    describe('integers', function(){

        it('validates type', function(done){
            db.insert('data_types', { id: uuid(), int: 3.5 }, err => {
                expect(err.message).toBe('3.5 is not a valid integer for column int');
                done();
            });
        });


        it('validates min', function(done){
            db.insert('data_types', { id: uuid(), int: -10 }, err => {
                expect(err.message).toBe('-10 is below min limit -5');
                done();
            });
        });


        it('validates max', function(done){
            db.insert('data_types', { id: uuid(), int: 6 }, err => {
                expect(err.message).toBe('6 exceeds max limit 5');
                done();
            });
        });
    });

    it('validates that something is mandatory', function(done){
        db.insert('data_types', { id: uuid(), int: 3 }, err => {
            expect(err.message).toBe('undefined is not a string for column mandatory');
            done();
        });
    });

    // this deliberately doesn't error as it would be a massive pain
    it('does not edit something that is uneditable', function(done){
        db.updateById('data_types', { id: seedId, uneditable: 'hello', int: 2 }, () => {
            db.getById('data_types', { id: seedId }, (err, res)=>{
                expect(res.uneditable).toBe('str');
                done();
            });
        });
    });

});
