const U = require('../utils');
const format = require('pg-format');
const async = require('async');

// not in the same query set cause it needs to return something
const retrieve = (db, config, cb) => {
    const {tableId, columns, _filter} = config;

    let tableConfig = db.tables[tableId];

    let columnsList = U.getColumnsList(columns, tableConfig.columns);
    console.log('getting filter string retrieve.js 12');

    let filterString = U.getFilterString(_filter);

    let mainQuery = format(
        'SELECT %s from %I %s',
        columnsList,
        tableId,
        filterString);

    const mainQueryCB = (err, resp) => {
        if (err){
            cb(err);
        } else if (!resp || !resp.rows){
            cb([]);
        } else {
            let outputData = resp.rows;

            let relevantSubTables = [];

            // check if we need any of the subcolumns of this table
            if (tableConfig.subTables){
                relevantSubTables = tableConfig.subTables.filter(subTable =>
                    !columns || columns.includes(subTable.id)
                );
            }

            if (relevantSubTables.length === 0){
                cb(undefined, outputData);
            } else {
                let idsToFind = outputData.map(x => x[tableConfig.key]);

                const eachSubTableCallback = (subTable, c1) => {
                    let subFilterString = format('%s IN (%L)', subTable.parentid, idsToFind);
                    let retrieveColumns;
                    if (config.subColumns && config.subColumns[subTable.id]){
                        retrieveColumns = config.subColumns[subTable.id];
                        if (!retrieveColumns.includes(subTable.parentid)){
                            retrieveColumns.push(subTable.parentid);
                        }
                    }

                    let retrieveOpts = {tableId: subTable.id, filter: subFilterString, columns: retrieveColumns, subColumns: config.subColumns}; // include subColumns incase you have nested subtables

                    const retrieveCallback = (e, subRows) => {
                        if (e){
                            c1(e);
                        } else {
                            if (subRows && subRows.length > 0){
                                // group subRows by key property
                                var groupedRows = U.indexArr(subRows, subTable.parentid);

                                // add the data to 'outputData'
                                outputData.forEach(row => {
                                    row[subTable.id] = groupedRows[row[tableConfig.key]];
                                });
                            }
                            c1();
                        }
                    };

                    retrieve(db, retrieveOpts, retrieveCallback);

                };

                const finalCallback = () => {
                    cb(undefined, outputData);
                };

                async.each(relevantSubTables, eachSubTableCallback, finalCallback);

            }

        }
    };

    db.pool.query(mainQuery, mainQueryCB);

};

module.exports = {retrieve};
