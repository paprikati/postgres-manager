const { Pool, types } = require('pg');
const U = require('./utils');

const initialise = require('./lib/initialise');
const reset = require('./lib/reset');
const drop = require('./lib/drop');
const { insert } = require('./lib/insert');
const { retrieve, retrieveById } = require('./lib/retrieve');
const { updateById, getSimpleUpdateQuery } = require('./lib/update');
const { _delete, deleteById } = require('./lib/delete');

module.exports = function DB({ tables, db }) {
    this.pool = new Pool(db);

    // make dates return a js date object
    var DATATYPE_DATE = 1082;
    types.setTypeParser(DATATYPE_DATE, function(val) {
        /* c8 ignore next */
        return val ? new Date(val) : val;
    });

    this.tables = tables;

    // populate table.key in each table config
    Object.keys(tables).forEach(tableId => {
        let keyProp = Object.keys(tables[tableId].columns).filter(
            colid => tables[tableId].columns[colid].isKey
        )[0];
        this.tables[tableId].key = keyProp;

        // populate subTable prop with subTable id by default
        if (tables[tableId].subTables){
            tables[tableId].subTables.forEach((subTable, index) => {
                this.tables[tableId].subTables[index].prop = subTable.prop || subTable.id;
            });
        }
    });

    this.insert = (tableId, rows, cb) => {
        insert(this, tableId, rows, {}, cb);
    };

    this.insertWithOpts = (tableId, rows, options, cb) => {
        insert(this, tableId, rows, options, cb);
    };

    this.insertAndPrep = (tableId, rows, prep, cb) => {
        insert(this, tableId, rows, {}, (err, data) => {
            if (err) {
                cb(err);
            } else {
                cb(null, prep(data));
            }
        });
    };

    this.updateBulk = (tableId, config, cb) => {
        let queries = getSimpleUpdateQuery(this, tableId, config);
        U.naiveWrapper(true, this, queries, cb);
    };

    this.updateById = (tableId, data, cb) => {
        updateById(this, tableId, data, cb);
    };

    this.getById = (tableId, options, cb) => {
        retrieveById(this, { tableId, ...options }, cb);
    };

    this.get = (tableId, options, cb) => {
        retrieve(this, { tableId, ...options }, cb);
    };

    this.retrieve = this.get; // alias

    this.getAndPrep = (tableId, options, prep, cb) => {
        retrieve(this, { tableId, ...options }, (err, data) => {
            if (err) {
                cb(err);
            } else {
                cb(null, prep(data));
            }
        });
    };

    this.delete = (tableId, config, cb) => {
        _delete(this, tableId, config, cb);
    };

    this.deleteById = (tableId, config, cb) => {
        deleteById(this, tableId, config, cb);
    };

    this.initialise = cb => {
        initialise(this, cb);
    };

    this.reset = cb => {
        reset(this, cb);
    };

    this.drop = cb => {
        drop(this, cb);
    };

    this.query = (query, cb) => {
        this.queryLog.push(query);
        this.pool.query(query, cb);
    };

    this.queryLog = [];

    this.clearQueryLog = () => {
        this.queryLog = [];
    };

    return this;
};
