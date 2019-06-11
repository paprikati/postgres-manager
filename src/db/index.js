const { Pool, types } = require('pg');
const format = require('pg-format');

module.exports = function DB({tables, db}){

    this.pool = new Pool(db);

    // make dates return a js date object
    var DATATYPE_DATE = 1082;
    types.setTypeParser(DATATYPE_DATE, function(val) {
        return val ? new Date(val) : val;
    });

    this.tables = tables;

    for (let [tableId, tableConfig] of Object.entries(tables)) {
        this[tableId] = new Table(tableId, tableConfig, this.pool);
    }


    return this;
};

function Table(id, config, pool){
    this.id = id;
    this.config = config;
    this.pool = pool;

    // TODO: fix this line (rows is being split into multiple args i think)
    this.insert = (rows, cb) => insert.apply(this, rows, cb);

    return this;
}

function getCellValue(config, val){
    if (val === undefined){
        return undefined;
    }

    switch (config.dataType){
        case 'uuid':
            if (!isGuid(val)){
                return error(`String ${val} is not a valid uuid`);
            }
            return val;
        case 'varchar':
            if (val && val.length > config.maxLength){
                return error(`String ${val} exceeds length limit ${config.maxLength}`);
            }
            return val;
        case 'json':
            return JSON.stringify(val);
        default:
            return error(`unsupported data type ${config.dataType}`);
    }
}

const insert = function(rows, cb) {
    const {pool, config, id} = this;

    let columnsList = Object.keys(config.columns);
    let values = [];
    for (let row of rows){
        let rowValues = [];

        for (let colId of columnsList){
            let columnConfig = config.columns[colId];
            let cellValue = getCellValue(columnConfig, row[colId]);
            if (typeof cellValue === 'object' && cellValue.isError){
                cb(new Error(cellValue.message));
                return;
            } else if (columnConfig.mandatory && cellValue === undefined){
                cb(new Error(`column ${colId} in table ${id} is mandatory`));
                return;
            } else {
                rowValues.push(cellValue);
            }
        }
        values.push(rowValues);
    }

    let query = format(
        'INSERT INTO %I (%s) VALUES %L',
        id,
        columnsList.join(', '),
        values);

    pool.query(query, cb);
};

const error = str => ({isError: true, message: str});

const isGuid = str => {
    let regex = RegExp(/^(\{{0,1}([0-9a-fA-F]){8}-([0-9a-fA-F]){4}-([0-9a-fA-F]){4}-([0-9a-fA-F]){4}-([0-9a-fA-F]){12}\}{0,1})$/);
    return regex.test(str);
};

// plans: {
//     columns: {
//         id: {
//             isKey: true,
//             dataType: 'uuid'
//         },
//         title: {
//             mandatory: true,
//             dataType: 'varchar',
//             maxLength: 100
//         },
//         owner: {
//             mandatory: true,
//             dataType: 'uuid'
//         }
//     },
//     indexes: {}
// }
