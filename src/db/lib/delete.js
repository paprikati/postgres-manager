const U = require('../utils');
const format = require('pg-format');
const async = require('async');
const {retrieve} = require('./retrieve');
/*
flow:

deepDelete grandParent:

get grandparents
delete grandparents

get all children
delete children

if(subtables of children)
*/

const getConfigOpt = (configKey, options, config) => {
    let isTrue = options[configKey];
    if (config[configKey]){
        switch (config[configKey]){
            case 'always':
                isTrue = true;
                break;
            case 'never':
                isTrue = false;
                break;
            default:
                break;
        }
    }
    return isTrue;
};

const _delete = (db, tableId, options, cb) => {
    const tableConfig = db.tables[tableId];

    // is it shallow or hard?
    let isShallow = getConfigOpt('shallow', options, tableConfig.deleteConfig);
    let isHard = getConfigOpt('hard', options, tableConfig.deleteConfig);
    let keyProp = tableConfig.key;
    // if its shallow, can just getDeleteQueries for this
    if (isShallow){
        let queries = getDeleteQueries(db, tableId, options, isHard);
        // in series, run the queries
        U.naiveWrapper(false, db, queries, cb);
        return;
    }

    // we need to pull the ids of what we're deleting before we delete it so we can find their children.
    let retrieveConfig = {
        tableId,
        _filter: options._filter,
        columns: [keyProp]};

    const retrieveCallback = (err, idObjs) => {

        let numberOfRowsDeleted = idObjs.length;
        if (err){
            cb(err);
            return;
        }
        if (numberOfRowsDeleted === 0){
            cb(null, numberOfRowsDeleted);
            return;
        }

        const _tasks = [];

        // delete the top level stuff
        _tasks.push(c1 => {
            let queries = getDeleteQueries(db, tableId, options, isHard);
            // in series, run the queries
            U.naiveWrapper(false, db, queries, c1);
        });

        let parentIds = idObjs.map(x => x[keyProp]);
        if (tableConfig.subTables){
            // go through each subtable
            tableConfig.subTables.forEach(subTable => {
                let _filter = {[subTable.parentid]: parentIds};
                _tasks.push(c1 => {
                    _delete(db, subTable.id, {_filter, hard: options.hard, shallow: false }, c1);
                });
            });
        }

        // actually run the tasks in series
        async.series(_tasks, e => {
            if (e){
                cb(e);
            } else {
                cb(null, numberOfRowsDeleted);
            }
        });
    };

    retrieve(db, retrieveConfig, retrieveCallback);

};

const deleteById = (db, tableId, options, cb) => {

    const tableConfig = db.tables[tableId];
    const keyProp = tableConfig.key;

    let newOptions = {
        _filter: {[keyProp]: options.id || options.ids},
        ...options
    };
    _delete(db, tableId, newOptions, cb);
};

// data can include filter and filters
const getDeleteQueries = (db, tableId, config, isHard) => {

    const tableConfig = db.tables[tableId];
    const deleteConfig = tableConfig.deleteConfig;

    console.log('getting filter string delete.js 119');
    const filterString = U.getFilterString(config._filter);

    const queries = [];

    // TODO ADD config validation e.g. deletedtable exists
    if (!isHard){
        let columns = deleteConfig.columns || '*';
        let columnsToPull = deleteConfig.columns ? `(${columns})` : '';
        let moveQuery = format('INSERT INTO %I %s SELECT %s FROM %I %s', deleteConfig.tableId, columnsToPull, columns, tableId, filterString);
        queries.push(moveQuery);

        let updateDateQuery = format('UPDATE %I SET deleted_date = %L %s', deleteConfig.tableId, new Date(), filterString);
        queries.push(updateDateQuery);
    }
    // push the actual delete
    let deleteQuery = format('DELETE FROM %I %s', tableId, filterString);
    queries.push(deleteQuery);

    return queries;
};

module.exports = {_delete, deleteById};
