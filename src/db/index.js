const { Pool, types } = require('pg');
const U = require('./utils');

const {getInsertQueries} = require('./lib/insert');
const {retrieve} = require('./lib/retrieve');
const {updateById, getSimpleUpdateQuery} = require('./lib/update');
const {_delete, deleteById} = require('./lib/delete');


module.exports = function DB({tables, db}){

    this.pool = new Pool(db);

    // make dates return a js date object
    var DATATYPE_DATE = 1082;
    types.setTypeParser(DATATYPE_DATE, function(val) {
        return val ? new Date(val) : val;
    });

    this.tables = tables;

    // populate table.key in each table config
    Object.keys(tables).forEach(tableId => {
        let keyProp = Object.keys(tables[tableId].columns).filter(colid => tables[tableId].columns[colid].isKey)[0];
        this.tables[tableId].key = keyProp;
    });

    this.insert = (tableId, rows, cb) => {
        let queries = getInsertQueries(this, tableId, rows);
        U.naiveWrapper(true, this, queries, cb);
    };

    this.update = (tableId, config, cb) => {
        let queries = getSimpleUpdateQuery(this, tableId, config);
        U.naiveWrapper(true, this, queries, cb);
    };

    this.updateById = (tableId, config, cb) => {
        updateById(this, tableId, config, cb);
    };

    this.get = (tableId, options, cb) => {
        retrieve(this, {tableId, ...options}, cb);
    };
    this.retrieve = this.get; // alias

    this.getAll = (tableId, cb) => {
        retrieve(this, {tableId}, cb);
    };

    this.delete = (tableId, config, cb) => {
        _delete(this, tableId, config, cb);
    };

    this.deleteById = (tableId, config, cb) => {
        deleteById(this, tableId, config, cb);
    };


    return this;
};
