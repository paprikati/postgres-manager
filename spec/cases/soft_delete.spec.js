const H = require('../helpers');
const dbConf = require('../configs/soft_delete.config');
const db = H.getDB(dbConf);
const uuid = require('uuid').v4;

const seedId = uuid();
const seedData = [{
    id: seedId,
    name: 'Nanny Ogg',
    parents: [
        {
            id: uuid(),
            name: 'Parent 0',
            home: {
                id: uuid(),
                name: 'Home 0'
            }
        },
        {
            id: uuid(),
            name: 'Parent 1',
            home: {
                id: uuid(),
                name: 'Home 1'
            }
        }
    ]
}];

describe('Soft Delete', function() {

    beforeAll(function(done) {
        H.initialiseDB(dbConf, done);
    });

    beforeEach(function(done){
        db.reset(() => {
            db.insert('grandparents', seedData, () => {
                db.clearQueryLog();
                done();
            });
        });
    });

    afterAll(done => db.drop(done));

    H.itIssuesCorrectSql(done => {
        db.drop(() => {
            db.clearQueryLog();
            db.initialise(done);
        });
    },
    'soft_delete/initialise-db',
    db
    );

    describe('delete', function() {
        it('#delete shallow', function(done) {
            db.delete('grandparents', { _filter: { id: seedId }, hard: true, shallow: true }, () => {
                db.get('grandparents', { _filter: { id: seedId } }, (e1, r1) => {
                    expect(r1.length).toEqual(0);
                    db.get('parents', { _filter: { grandparent_id: seedId } }, (e2, r2) => {
                        expect(r2.length).toEqual(2);
                        done();
                    });
                });
            });
        });
        H.itIssuesCorrectSql(done => db.delete('grandparents', { _filter: { id: seedId }, hard: true, shallow: true }, done),
            'soft_delete/delete-shallow',
            db
        );

        it('#delete deep', function(done) {
            db.delete('grandparents', { _filter: { id: seedId }, shallow: false }, err => {
                db.getById('grandparents',  { id: seedId }, (e1, r1) => {
                    expect(r1).toBeFalsy;
                    db.get('parents', { _filter: { grandparent_id: seedId } }, (e2, r2) => {
                        expect(r2.length).toEqual(0);
                        db.get('homes', { _filter: { grandparent_id: seedId } }, (e3, r3) => {
                            expect(r3.length).toEqual(0);
                            db.query('SELECT * FROM deleted_grandparents', (e4, r4) => {
                                expect(r4.rows[0].family).toEqual(seedData[0]);
                                done();
                            });
                        });
                    });
                });
            });
        });

        H.itIssuesCorrectSql(done => db.delete('grandparents', { _filter: { id: seedId }, shallow: false }, done),
            'soft_delete/delete-deep',
            db
        );

        it('#delete (hard override)', function(done) {
            db.delete('grandparents', { _filter: { id: seedId }, shallow: false, hard: true }, err => {
                db.getById('grandparents',  { id: seedId }, (e1, r1) => {
                    expect(r1).toBeFalsy;
                    db.get('parents', { _filter: { grandparent_id: seedId } }, (e2, r2) => {
                        expect(r2.length).toEqual(0);
                        db.get('homes', { _filter: { grandparent_id: seedId } }, (e3, r3) => {
                            expect(r3.length).toEqual(0);
                            db.query('SELECT * FROM deleted_grandparents', (e4, r4) => {
                                expect(r4.rows.length).toBe(0);
                                done();
                            });
                        });
                    });
                });
            });
        });

        H.itIssuesCorrectSql(done => db.delete('grandparents', { _filter: { id: seedId }, shallow: false, hard: true }, done),
            'soft_delete/delete-hard',
            db
        );

        it('#delete (not condensed)', function(done) {
            db.delete('grandparents', { _filter: { id: seedId }, shallow: false, condense: false }, err => {
                db.getById('grandparents',  { id: seedId }, (e1, r1) => {
                    expect(r1).toBeFalsy;
                    db.get('parents', { _filter: { grandparent_id: seedId } }, (e2, r2) => {
                        expect(r2.length).toEqual(0);
                        db.get('homes', { _filter: { grandparent_id: seedId } }, (e3, r3) => {
                            expect(r3.length).toEqual(0);
                            done();
                        });
                    });
                });
            });
        });

        H.itIssuesCorrectSql(done => db.delete('grandparents', { _filter: { id: seedId }, shallow: false, condense: false }, done),
            'soft_delete/delete-not-condensed',
            db
        );
    });
});
