const U = require('../utils');
const format = require('pg-format');
const uuid = require('uuid').v4;

const insert = (db, tableId, rows, callback) => {
    if (!Array.isArray(rows)) {
        rows = [rows];
    }

    console.log(rows);
    rows = U.addIdsAndInherits(db, tableId, rows);
    console.log(rows);

    // get all our insert queries
    let queries = getInsertQueries(db, tableId, rows);
    U.naiveWrapper(false, db, queries, error => {
        if (error) {
            callback(error);
        } else {
            callback(null, rows);
        }
    });
};

const getInsertQueries = (db, tableId, rows) => {
    const tableConfig = db.tables[tableId];
    let columnsList = Object.keys(tableConfig.columns);
    let values = [];

    for (let row of rows) {
        let rowValues = [];

        for (let colId of columnsList) {
            let columnConfig = tableConfig.columns[colId];
            let cellValue = U.getCellValue(columnConfig, row[colId], colId);
            if (
                (columnConfig.mandatory || columnConfig.isKey) &&
                cellValue === undefined
            ) {
                throw new Error(
                    `column ${colId} in table ${tableId} is mandatory`
                );
            }

            rowValues.push(cellValue);
        }
        values.push(rowValues);
    }

    let mainQuery = format(
        'INSERT INTO %I (%s) VALUES %L',
        tableId,
        columnsList.join(', '),
        values
    );

    console.log('checking subtables for table');
    console.log(tableId);
    let subQueries = [];
    // check if we need to update other tables
    if (tableConfig.subTables) {
        tableConfig.subTables.forEach(subTable => {
            let subRows = [];
            rows.forEach(row => {
                if (row[subTable.id]) {
                    subRows = subRows.concat(row[subTable.id]);
                }
            });
            if (subRows.length > 0) {
                subQueries = subQueries.concat(
                    getInsertQueries(db, subTable.id, subRows)
                );
            }
        });
    }
    console.log('found subtables:');
    console.log(subQueries);

    return [mainQuery, ...subQueries];
};

module.exports = { insert, getInsertQueries };
