const U = require('../utils');
const format =  require('pg-format');

const getInsertQueries = (db, tableId, rows) => {

    const tableConfig = db.tables[tableId];
    const keyProp = tableConfig.key;

    let columnsList = Object.keys(tableConfig.columns);
    let values = [];
    if (!Array.isArray(rows)){
        rows = [rows];
    }
    for (let row of rows){
        let rowValues = [];

        for (let colId of columnsList){
            let columnConfig = tableConfig.columns[colId];
            let cellValue = U.getCellValue(columnConfig, row[colId]);
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
        tableConfig.subTables.forEach(subTable => {
            let subRows = [];
            rows.forEach(row => {
                if (row[subTable.id]){
                    let rowsToAdd = row[subTable.id].map(subRow => {
                        subRow[subTable.parentid] = row[keyProp];
                        return subRow;
                    });
                    subRows = subRows.concat(rowsToAdd);
                }
            });
            if (subRows.length > 1){
                subQueries = subQueries.concat(getInsertQueries(db, subTable.id, subRows));
            }
        });
    }

    return [mainQuery, ...subQueries];
};

module.exports = {getInsertQueries};
