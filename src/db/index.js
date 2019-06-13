const { Pool, types } = require('pg');
const format = require('pg-format');
const async = require('async');
const U = require('./utils');

// not in the same query set cause it needs to return something
const retrieve = (db, {tableId, filters, filter, columns}, cb) => {

    let tableConfig = db.tables[tableId];

    let columnsList = '*';
    if (columns){
        columnsList = columns.join(', ');
    }

    let filterString = '';
    if (filters){
        let filterArr = filters.map(([col, val]) => {
            return format('%I = %L', col, val);
        });
        filterString = `WHERE ${filterArr.join(' AND ')}`;
    } else if (filter) {
        filterString = 'WHERE ' + filter;
    }

    let mainQuery = format(
        'SELECT %s from %I %s',
        columnsList,
        tableId,
        filterString);

    db.pool.query(mainQuery, ((err, resp) => {
        if (err){
            cb(err);
        } else {

            let subQueries = [];

            // check if we need any of the subcolumns of this table
            if (tableConfig.subTables){
                tableConfig.subTables.forEach(subTableId => {
                    if (!columns || columns.includes(subTableId)){

                    }

                });
            }

            if (subQueries.length === 0){
                cb(resp.rows || resp);
            } else {

            }


        }
    }));



    db.pool.query(mainQuery, cb);

};

const getInsertQuery = (db, tableId, rows) => {

    let tableConfig = db.tables[tableId];

    let columnsList = Object.keys(tableConfig.columns);
    let values = [];
    for (let row of rows){
        let rowValues = [];

        for (let colId of columnsList){
            let columnConfig = tableConfig.columns[colId];
            let cellValue = getCellValue(columnConfig, row[colId]);
            if (columnConfig.mandatory && cellValue === undefined){
                throw new Error(`column ${colId} in table ${tableId} is mandatory`);
            }

            rowValues.push(cellValue);
        }
        values.push(rowValues);
    }

    let mainQuery = format(
        'INSERT INTO %I (%s) VALUES %L',
        tableId,
        columnsList.join(', '),
        values);

    let subQueries = [];
    // check if we need to update other tables
    if (tableConfig.subTables){
        tableConfig.subTables.forEach(subTableId => {
            let subRows = [];
            rows.forEach(row => {
                if (row[subTableId]){
                    subRows = subRows.concat(row[subTableId]);
                }
            });
            if (subRows.length > 1){
                subQueries = subQueries.concat(getInsertQuery(db, subTableId, subRows));
            }
        });
    }

    return [mainQuery, ...subQueries];
};

const getQueries = (db, queryType, data) => {
    let {tableId} = data;
    switch (queryType){
        case 'insert':
            let {rows} = data;
            return getInsertQuery(db, tableId, rows);
        default:
            console.log('error in getQueries');
            break;
    }

};

const getCellValue = (config, val) =>{
    if (val === undefined){
        return undefined;
    }

    switch (config.dataType){
        case 'uuid':
            if (!U.isGuid(val)){
                throw new Error(`String ${val} is not a valid uuid`);
            }
            return val;
        case 'varchar':
            if (val && val.length > config.maxLength){
                throw new Error(`String ${val} exceeds length limit ${config.maxLength}`);
            }
            return val;
        case 'json':
            return JSON.stringify(val);
        default:
            throw new Error(`unsupported data type ${config.dataType}`);
    }
};

module.exports = function DB({tables, db}){

    this.pool = new Pool(db);

    // make dates return a js date object
    var DATATYPE_DATE = 1082;
    types.setTypeParser(DATATYPE_DATE, function(val) {
        return val ? new Date(val) : val;
    });

    this.tables = tables;

    this.getQueries = getQueries;

    this.insert = (tableId, rows, cb) => {
        naivePostWrapper(this, 'insert', {tableId, rows}, cb);
    };

    this.get = (tableId, options, cb) => {
        retrieve(this, {tableId, ...options}, cb);
    };

    this.getAll = (tableId, cb) => {
        retrieve(this, {tableId}, cb);
    };

    this.retrieve = this.get; // alias



    return this;
};

const naivePostWrapper = (db, action, data, cb) => {
    try {
        let queries = getQueries(db, action, data);
        let _tasks = queries.map(query => {
            return c1 => {
                db.pool.query(query, c1);
            };
        });
        async.parallel(_tasks, cb);
    } catch (e){
        cb(e);
    }
};
