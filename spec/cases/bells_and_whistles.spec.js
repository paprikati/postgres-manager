const H = require('../helpers');
const dbConf = require('../configs/bells_and_whistles.config');
const db = H.getDB(dbConf);
const uuid = require('uuid').v4;

const seedId = uuid();
const seedData = [
    {
        id: seedId,
        name: 'John Doe'
    },
    {
        name: 'Adam Apple'
    },
    {
        name: 'Billy the Bear'
    }
];

describe('Bells and whistles', function() {

    beforeAll(function(done) {
        H.initialiseDB(dbConf, done);
    });

    beforeEach(function(done){
        db.reset(() => {
            db.insert('people', seedData, done);
        });
    });

    afterAll(done => db.drop(done));

    H.itIssuesCorrectSql(done => {
        db.drop(() => {
            db.clearQueryLog();
            db.initialise(done);
        });
    },
    'bells_and_whistles/initialise-db',
    db
    );

    it('#generateUUID', function(done) {
        const testData = { name: 'Charlie Chaplain' };
        db.insert('people', testData, (error, res) => {
            expect(res[0].id).toBeTruthy;
            db.getById('people', { id: res[0].id }, (e2, r2) => {
                expect(r2.name).toBe('Charlie Chaplain');
                done();
            });
        });
    });

    it('#mapOnRetrieve', function(done) {
        db.getById('people', { id: seedId }, (err, res) => {
            expect(res.extraProp).toBe(true);
            done();
        });
    });

    it('#sortBy', function(done) {
        db.get('people', {}, (err, res) => {
            expect(res.map(x => x.name)).toEqual(['Adam Apple', 'Billy the Bear', 'John Doe']);
            done();
        });
    });

    it('#custom validation function', function(done) {
        const testData = { name: 'banned' };
        db.insert('people', testData, err => {
            expect(err.message).toBe('"banned" failed custom validation function for column name');
            done();
        });
    });

});
