const format = require('pg-format');
const async = require('async');
const U = require('../utils');
const { deleteById } = require('./delete.js');
const { insert } = require('./insert.js');

// just handles updating a single table - no subtables
const getSimpleUpdateQuery = (db, tableId, config) => {
    const { data, strict, columns, _filter } = config;
    const dataToUpdate = { ...data };

    let tableConfig = db.tables[tableId];

    let columnsToUpdate =
        columns ||
        Object.keys(tableConfig.columns).filter(
            x => tableConfig.columns[x].editable
        );

    if (strict) {
        // check that all keys on the newData object exist and are editable
        Object.keys(dataToUpdate).forEach(k => {
            if (!tableConfig.columns[k]) {
                throw new Error(
                    `column ${k} does not exist on table ${tableId}`
                );
            }
            if (!tableConfig.columns[k].editable) {
                throw new Error(
                    `column ${k} in table ${tableId} is not editable`
                );
            }
        });
    } else {
        // remove everything from the data which isn't in the columns or isnt editable
        Object.keys(dataToUpdate).forEach(k => {
            if (!tableConfig.columns[k] || !tableConfig.columns[k].editable) {
                delete dataToUpdate[k];
            }
        });
    }

    let filterString = U.getFilterString(_filter);

    let toUpdateString = U.getUpdateString(
        dataToUpdate,
        columnsToUpdate,
        tableConfig.columns
    );

    let mainQuery = format(
        'UPDATE %I SET %s %s',
        tableId,
        toUpdateString,
        filterString
    );

    return mainQuery;
};

const updateById = (db, tableId, data, callback) => {
    // run the updatequery for main table

    const { pool, tables } = db;
    const tableConfig = tables[tableId];
    const keyProp = tableConfig.key;

    if (!data[keyProp]) {
        callback(
            `Please ensure that the data has a value for table key property ${keyProp}`
        );
        return;
    }

    // use addIds and inherits function to get all the ids created
    data = U.addIdsAndInherits(db, tableId, data);

    const id = data[keyProp];
    const _filter = { [keyProp]: id };
    const query = getSimpleUpdateQuery(db, tableId, { data, _filter });

    pool.query(query, (err, resp) => {
        if (err) {
            callback(err);
            return;
        } else {
            let _tasks = [];
            // then loop through subTables and see if theres anything there to update
            if (tableConfig.subTables) {
                tableConfig.subTables.forEach(subTable => {
                    // only do something if its on the data
                    if (data[subTable.id]) {
                        _tasks.push(c1 => {
                            updateSubTable(
                                subTable,
                                id,
                                data[subTable.id],
                                db,
                                c1
                            );
                        });
                    }
                });
            }
            if (_tasks.length === 0) {
                callback(null, data);
                return;
            }
            async.parallel(_tasks, e => {
                if (e) {
                    callback(e);
                } else {
                    callback(null, data);
                }
            });
        }
    });
};

const bulkUpdateById = (db, tableId, rows, cb) => {
    async.each(
        rows,
        (row, c1) => {
            updateById(db, tableId, row, c1);
        },
        cb
    );
};

const updateSubTable = (subTable, id, newRows, db, cb) => {
    const { pool, tables } = db;
    const tableConfig = tables[subTable.id];
    const keyProp = tableConfig.key;

    getExistingRows((error, existingRows) => {
        if (error) {
            cb(error);
        } else {
            let { toDeleteIds, toUpdate, toCreate } = U.getDiff(
                existingRows,
                newRows
            );

            toCreate = toCreate.map(ea => {
                ea[subTable.parentid] = id;
                return ea;
            });

            const _tasks = [
                function(c) {
                    if (toCreate.length > 0) {
                        insert(db, subTable.id, toCreate, c);
                    } else {
                        c();
                    }
                },
                function(c) {
                    if (toUpdate.length > 0) {
                        bulkUpdateById(db, subTable.id, toUpdate, c);
                    } else {
                        c();
                    }
                },
                function(c) {
                    if (toDeleteIds.length > 0) {
                        deleteById(
                            db,
                            subTable.id,
                            {
                                ids: toDeleteIds,
                                hard: true
                            },
                            c
                        );
                    } else {
                        c();
                    }
                }
            ];

            const callback = e => {
                if (e) {
                    cb(e);
                } else {
                    cb();
                }
            };

            async.parallel(_tasks, callback);
        }
    });

    function getExistingRows(c) {
        const query = format(
            'SELECT %I FROM %I WHERE %I = %L',
            keyProp,
            subTable.id,
            subTable.parentid,
            id
        );

        pool.query(query, (error, results) => {
            if (error) {
                c(error);
            } else {
                c(undefined, results.rows);
            }
        });
    }
};

module.exports = {
    getSimpleUpdateQuery,
    updateById,
    bulkUpdateById,
    updateSubTable
};
