const H = require('../helpers');
const dbConf = require('../configs/hierarchies.config');
const db = H.getDB(dbConf);
const _ = require('lodash');
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
            ],
            home: {
                id: uuid(),
                name: 'Home 0'
            }
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
            ],
            home: {
                id: uuid(),
                name: 'Home 1'
            }
        }
    ]
}];

const seedData2 = [{
    id: uuid(),
    name: 'Someone Else',
    parents: [
        {
            id: uuid(),
            name: 'XParent 0',
            children: [
                {
                    id: uuid(),
                    name: 'XChild 0-0'
                },
                {
                    id: uuid(),
                    name: 'XChild 0-1'
                }
            ],
            home: {
                id: uuid(),
                name: 'XHome 0'
            }
        },
        {
            id: uuid(),
            name: 'XParent 1',
            children: [
                {
                    id: uuid(),
                    name: 'XChild 1-0'
                },
                {
                    id: uuid(),
                    name: 'XChild 1-1'
                }
            ],
            home: {
                id: uuid(),
                name: 'XHome 1'
            }
        }
    ]
}];

describe('Hierarchies', function() {

    beforeAll(function(done) {
        H.initialiseDB(dbConf, done);
    });

    beforeEach(function(done){
        db.reset(() => {
            db.insert('grandparents', [...seedData, ...seedData2], () => {
                db.clearQueryLog();
                done();
            });
        });
    });

    describe('insert', function() {
        H.itIssuesCorrectSql(done =>
            db.reset(() => {
                db.clearQueryLog();
                db.insert('grandparents', seedData, done);
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
        it('#update bulk', function(done) {
            db.updateBulk('grandparents', { data: { name: 'Jane Doe' }, _filter: { id: seedId } }, () => {
                db.getById('grandparents', { id: seedId }, (err, res) => {
                    expect(res.name).toEqual('Jane Doe');
                    expect(res.id).toEqual(seedId);
                    done();
                });
            });
        });

        H.itIssuesCorrectSql(done => db.updateBulk('grandparents', { data: { name: 'Jane Doe' }, _filter: { id: seedId } }, done),
            'hierarchies/update-bulk',
            db
        );

        describe('update deep', function(){
            const deepUpdateData = _.cloneDeep(seedData[0]);
            deepUpdateData.parents[0].children[0].name = 'New Child Name';
            deepUpdateData.parents[0].home.name = 'New Home Name';

            it('#update deep', function(done) {
                db.updateById('grandparents', deepUpdateData, () => {
                    db.getById('grandparents', { id: seedId }, (err, res) => {
                        expect(res.parents[0].children[0].name).toEqual('New Child Name');
                        expect(res.parents[0].home.name).toEqual('New Home Name');
                        done();
                    });
                });
            });

            H.itIssuesCorrectSql(done => db.updateById('grandparents', deepUpdateData, done),
                'hierarchies/update-deep',
                db
            );
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

        H.itIssuesCorrectSql(done => db.retrieve('grandparents', { _filter: { id: seedId }, shallow: false }, done),
            'hierarchies/retrieve',
            db
        );

        H.itIssuesCorrectSql(done => db.retrieve('parents', { _filter: { grandparent_id: seedId }, shallow: false }, done),
            'hierarchies/retrieve-parents',
            db
        );
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
        H.itIssuesCorrectSql(done => db.delete('grandparents', { _filter: { id: seedId }, hard: true, shallow: true }, done),
            'hierarchies/delete-shallow',
            db
        );

        it('#delete deep', function(done) {
            db.delete('grandparents', { _filter: { id: seedId }, hard: true, shallow: false }, () => {
                db.get('grandparents', { _filter: { id: seedId } }, (e1, r1) => {
                    expect(r1.length).toEqual(0);
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

        H.itIssuesCorrectSql(done => db.delete('grandparents', { _filter: { id: seedId }, hard: true, shallow: false }, done),
            'hierarchies/delete-deep',
            db
        );

        it('#delete something that doesnt exist', function(done) {
            db.delete('grandparents', { _filter: { id: uuid() }, hard: true, shallow: false }, (err, res) => {
                expect(res).toEqual(0);
                done();
            });
        });

        H.itIssuesCorrectSql(done => db.delete('grandparents', { _filter: { id: uuid() }, hard: true, shallow: false }, done),
            'hierarchies/delete-nothing',
            db
        );
    });
});
