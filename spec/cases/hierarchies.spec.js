const H = require('../helpers');
const dbConf = require('../configs/hierarchies.config');
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
            children: [
                {
                    id: uuid(),
                    name: 'Child 0-0'
                },
                {
                    id: uuid(),
                    name: 'Child 0-1'
                }
            ]
            // home: {
            //     id: uuid(),
            //     name: 'Home 0'
            // }
        },
        {
            id: uuid(),
            name: 'Parent 1',
            children: [
                {
                    id: uuid(),
                    name: 'Child 1-0'
                },
                {
                    id: uuid(),
                    name: 'Child 1-1'
                }
            ]
            // home: {
            //     id: uuid(),
            //     name: 'Home 1'
            // }
        }
    ]
}];

describe('Hierarchies', function() {

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

    describe('insert', function() {
        H.itIssuesCorrectSql(done =>
            db.reset(() => {
                db.clearQueryLog();
                db.insert('grandparents', seedData, () => {
                    done();
                });
            }),
        'hierarchies/insert',
        db
        );

        it('#insert', function(done) {
            db.get('parents', { _filter: { grandparent_id: seedId } }, (err, res) => {
                expect(res).toEqual(seedData[0].parents);
                done();
            });
        });

        it('passes down grandparent id', function(done) {
            db.get('children', { _filter: { grandparent_id: seedId } }, (err, res) => {
                expect(res.length).toEqual(4);
                done();
            });
        });
    });

    describe('update', function() {
        it('#update', function(done) {
            const updatedSeedData = { name: 'Jane Doe' };
            db.update('grandparents', { data: updatedSeedData, _filter: { id: seedId } }, () => {
                db.getById('grandparents', { id: seedId }, (err, res) => {
                    expect(res.name).toEqual('Jane Doe');
                    expect(res.id).toEqual(seedId);
                    done();
                });
            });
        });
    });

    describe('retrieve', function() {
        it('#retrieve shallow', function(done) {
            db.retrieve('grandparents', { _filter: { id: seedId }, shallow: true }, (err, res) => {
                expect(res[0].id).toEqual(seedId);
                expect(res[0].parents).toBeFalsy;
                done();
            });
        });

        it('#retrieve deep', function(done) {
            db.retrieve('grandparents', { _filter: { id: seedId }, shallow: false  }, (err, res) => {
                expect(res[0].id).toEqual(seedId);
                expect(res[0].parents).toBeTruthy;
                done();
            });
        });
    });

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
        it('#delete deep', function(done) {
            db.delete('grandparents', { _filter: { id: seedId }, hard: true, shallow: false }, () => {
                db.get('grandparents', { _filter: { id: seedId } }, (e1, r1) => {
                    expect(r1.length).toEqual(0);
                    db.get('parents', { _filter: { grandparent_id: seedId } }, (e2, r2) => {
                        expect(r2.length).toEqual(0);
                        done();
                    });
                });
            });
        });

    });
});
