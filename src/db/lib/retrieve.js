const U = require('../utils');
const format = require('pg-format');
const async = require('async');

// not in the same query set cause it needs to return something
const retrieve = (db, config, callback) => {
    const { tableId, columns, _filter } = config;

    let tableConfig = db.tables[tableId];

    let columnsList = U.getColumnsList(columns, tableConfig.columns);

    let filterString = U.getFilterString(_filter);

    let mainQuery = format(
        'SELECT %s from %I %s',
        columnsList,
        tableId,
        filterString
    );

    const mainQueryCB = (err, resp) => {
        if (err) {
            callback(err);
        } else if (!resp || !resp.rows) {
            callback([]);
        } else {
            let outputData = resp.rows;

            // check if we need to fix the outputData at all
            outputData = U.fixOutputData(outputData, tableConfig);

            let relevantSubTables = [];

            // check if we need any of the subcolumns of this table
            if (tableConfig.subTables && !config.shallow) {
                relevantSubTables = tableConfig.subTables.filter(
                    subTable => !columns || columns.includes(subTable.id)
                );
            }

            if (relevantSubTables.length === 0) {
                if (config.index) {
                    outputData = U.indexArr(outputData, tableConfig.key);
                }
                callback(undefined, outputData);
            } else {
                let idsToFind = outputData.map(x => x[tableConfig.key]);

                const eachSubTableCallback = (subTable, c1) => {
                    let subFilterString = format(
                        '%s IN (%L)',
                        subTable.parentid,
                        idsToFind
                    );
                    let retrieveColumns;
                    if (config.subColumns && config.subColumns[subTable.id]) {
                        retrieveColumns = config.subColumns[subTable.id];
                        if (!retrieveColumns.includes(subTable.parentid)) {
                            retrieveColumns.push(subTable.parentid);
                        }
                    }

                    let retrieveOpts = {
                        tableId: subTable.id,
                        filter: subFilterString,
                        columns: retrieveColumns,
                        subColumns: config.subColumns
                    }; // include subColumns incase you have nested subtables

                    const retrieveCallback = (e, subRows) => {
                        if (e) {
                            c1(e);
                        } else {
                            if (subRows && subRows.length > 0) {
                                // group subRows by key property
                                var groupedRows = U.indexArr(
                                    subRows,
                                    subTable.parentid,
                                    true
                                );

                                // add the data to 'outputData'
                                outputData.forEach(row => {
                                    let theseSubRows =
                                        groupedRows[row[tableConfig.key]] || [];
                                    row[subTable.id] = theseSubRows;
                                });
                            }
                            c1();
                        }
                    };

                    retrieve(db, retrieveOpts, retrieveCallback);
                };

                const finalCallback = () => {
                    if (config.index) {
                        outputData = U.indexArr(outputData, tableConfig.key);
                    }
                    callback(undefined, outputData);
                };

                async.each(
                    relevantSubTables,
                    eachSubTableCallback,
                    finalCallback
                );
            }
        }
    };

    db.pool.query(mainQuery, mainQueryCB);
};

const retrieveById = (db, config, callback) => {
    let tableConfig = db.tables[config.tableId];
    config._filter = { [tableConfig.key]: config.id };
    retrieve(db, config, (err, rows) => {
        if (err) {
            callback(err);
            return;
        }
        callback(null, rows[0]);
    });
};

module.exports = { retrieve, retrieveById };
