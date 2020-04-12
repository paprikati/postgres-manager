const H = require('../helpers');
const dbConf = require('../configs/basic.config');
const db = H.getDB(dbConf);
const uuid = require('uuid').v4;

const seedId = uuid();
const seedData = [
    {
        id: seedId,
        name: 'John Doe'
    }
];

describe('Basic', function() {

    beforeAll(function(done) {
        H.initialiseDB(dbConf, done);
    });

    // put back the seed Data.
    beforeEach(function(done){
        db.reset(() => {
            db.insert('people', seedData, done);
        });
    });

    describe('insert', function() {
        it('#insert', function(done) {
            const testData = { id: uuid(), name: 'Charlie Chaplain' };
            db.insert('people', testData, (error, res) => {
                expect(res[0]).toEqual(testData);
                done();
            });
        });

        H.itIssuesCorrectSql(done => db.insert('people', { id: uuid(), name: 'Charlie Chaplain' }, done),
            'basics/insert',
            db
        );

        it('#insertWithOpts', function(done){
            db.insertWithOpts('people', seedData, { ignoreConflicts: true }, (error, res) => {
                expect(res).toEqual(seedData);
                done();
            });
        });

        H.itIssuesCorrectSql(done => db.insertWithOpts('people', seedData, { ignoreConflicts: true }, done),
            'basics/insertWithOpts',
            db
        );

        it('#insertAndPrep', function(done){
            const testData = { id: uuid(), name: 'Donald Duck' };
            db.insertAndPrep('people', testData, a => a[0], (error, res) => {
                expect(res).toEqual(testData);
                done();
            });
        });
    });

    describe('update', function() {
        it('#updateBulk', function(done) {
            const updatedSeedData = { name: 'Jane Doe' };
            db.updateBulk('people', { data: updatedSeedData, _filter: { id: seedId } }, () => {
                db.getById('people', { id: seedId }, (err, res) => {
                    expect(res.name).toEqual('Jane Doe');
                    expect(res.id).toEqual(seedId);
                    done();
                });
            });
        });

        H.itIssuesCorrectSql(done => db.updateBulk('people', { data: { name: 'Jane Doe' }, _filter: { id: seedId } }, done),
            'basics/updateBulk',
            db
        );

        it('#updateById', function(done){
            const updatedSeedData = { ...seedData, name: 'Jimmy Doe' };
            db.updateById('people', updatedSeedData, () => {
                db.getById('people', { id: seedId }, (err, res) => {
                    expect(res).toEqual(seedData[0]);
                    done();
                });
            });
        });

        H.itIssuesCorrectSql(done => db.updateById('people', { id: seedId, name: 'Jimmy Doe' }, done),
            'basics/updateById',
            db
        );
    });

    describe('retrieve', function() {
        it('#get', function(done) {
            db.get('people', { _filter: { id: seedId } }, (err, res) => {
                expect(res[0].id).toEqual(seedId);
                done();
            });
        });

        H.itIssuesCorrectSql(done => db.get('people', { _filter: { id: seedId } }, done),
            'basics/get',
            db
        );

        it('#retrieve', function(done) {
            db.retrieve('people', { _filter: { id: seedId } }, (err, res) => {
                expect(res[0].id).toEqual(seedId);
                done();
            });
        });

        it('#retrieve with index=true', function(done) {
            db.retrieve('people', { _filter: { id: seedId }, index: true  }, (err, res) => {
                expect(res[seedId]).toEqual(seedData[0]);
                done();
            });
        });

        it('#getById', function(done){
            db.getById('people', { id: seedId }, (err, res) => {
                expect(res).toEqual(seedData[0]);
                done();
            });
        });

        H.itIssuesCorrectSql(done => db.getById('people',  { id: seedId }, done),
            'basics/getById',
            db
        );

        it('#getAndPrep', function(done){
            db.getAndPrep('people', { _filter: { id: seedId } }, data => data[0], (err, res) => {
                expect(res).toEqual(seedData[0]);
                done();
            });
        });

        it('can filter by multiple criteria', function(done){
            db.get('people', { _filter: { id: seedId, name: 'Jimmy No Mates' } }, (err, res) => {
                expect(res.length).toEqual(0);
                done();
            });
        });
        H.itIssuesCorrectSql(done => db.get('people', { _filter: { id: seedId, name: 'Jimmy No Mates' } }, done),
            'basics/get-filter',
            db
        );
    });

    describe('delete', function() {
        it('#delete', function(done) {
            db.delete('people', { _filter: { id: seedId }, hard: true }, () => {
                db.get('people', { _filter: { id: seedId } }, (err, res) => {
                    expect(res.length).toEqual(0);
                    done();
                });
            });
        });

        H.itIssuesCorrectSql(done => db.delete('people', { _filter: { id: seedId }, hard: true }, done),
            'basics/delete',
            db
        );

        it('#deleteById', function(done) {
            db.deleteById('people',  { id: seedId, hard: true }, () => {
                db.get('people', { _filter: { id: seedId } }, (err, res) => {
                    expect(res.length).toEqual(0);
                    done();
                });
            });
        });

        H.itIssuesCorrectSql(done => db.deleteById('people', { id: seedId, hard: true }, done),
            'basics/deleteById',
            db
        );

        it('#deleteById with ids', function(done) {
            db.deleteById('people',  { ids: [seedId], hard: true }, () => {
                db.get('people', { _filter: { id: seedId } }, (err, res) => {
                    expect(res.length).toEqual(0);
                    done();
                });
            });
        });

        H.itIssuesCorrectSql(done => db.deleteById('people', { ids: [seedId], hard: true }, done),
            'basics/deleteById-multiple',
            db
        );
    });
});
