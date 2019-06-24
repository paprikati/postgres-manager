const async = require('async');
const format = require('pg-format');
const uuid = require('uuid').v4;

const isGuid = str => {
    let regex = RegExp(
        /^(\{{0,1}([0-9a-fA-F]){8}-([0-9a-fA-F]){4}-([0-9a-fA-F]){4}-([0-9a-fA-F]){4}-([0-9a-fA-F]){12}\}{0,1})$/
    );
    return regex.test(str);
};

const indexArr = (arr, prop, returnArrs) => {
    const output = {};
    arr.forEach(item => {
        let val = item[prop];
        if (returnArrs) {
            if (output[val]) {
                output[val].push(item);
            } else {
                output[val] = [item];
            }
        } else {
            output[val] = item;
        }
    });
    return output;
};

const getColumnsList = (columns, tableColumns) => {
    if (!columns) {
        return '*';
    } else {
        return columns.filter(col => tableColumns[col]).join(', ');
    }
};

const getFilterString = _filter => {
    let filterString = '';
    if (typeof _filter === 'string') {
        filterString = 'WHERE ' + _filter;
    } else if (typeof _filter === 'object') {
        let filterArr = Object.entries(_filter).map(([col, val]) => {
            if (Array.isArray(val)) {
                return format('%I IN (%L)', col, val);
            } else {
                return format('%I = %L', col, val);
            }
        });
        filterString = `WHERE ${filterArr.join(' AND ')}`;
    }
    // if _filter is undefined, filterstring remains as ''
    return filterString;
};

const getUpdateString = (data, columnsToUpdate, columnConfig) => {
    return Object.keys(data)
        .filter(col => columnsToUpdate.includes(col))
        .map(col => {
            let cellValue = getCellValue(columnConfig[col], data[col], col);
            return format('%I = %L', col, cellValue);
        })
        .join(', ');
};

const checkMinMax = (config, val) => {
    if (config.max && config.max < val) {
        throw new Error(`${val} exceeds max limit ${config.max}`);
    }
    if (config.min && config.min < val) {
        throw new Error(`${val} is below min limit ${config.min}`);
    }
    return;
};

const getCellValue = (config, val, colid) => {
    if ((!config.mandatory && val === undefined) || val === null) {
        return val;
    }

    if (config.validator && !config.validator(val)) {
        throw new Error(
            `${val} failed custom validation function for column ${colid}`
        );
    }

    switch (config.dataType) {
        case 'uuid':
            if (!isGuid(val)) {
                throw new Error(
                    `String ${val} is not a valid uuid for column ${colid}`
                );
            }
            return val;
        case 'text':
            if (typeof val !== 'string') {
                throw new Error(`${val} is not a string for column ${colid}`);
            }
            return val;
        case 'varchar':
            if (typeof val !== 'string') {
                throw new Error(`${val} is not a string for column ${colid}`);
            }
            if (val && val.length > config.maxLength) {
                throw new Error(
                    `String ${val} exceeds length limit ${
                        config.maxLength
                    } for column ${colid}`
                );
            }
            return val;
        case 'int':
            // if val is a string, parseFloat it
            if (typeof val === 'string') {
                val = parseFloat(val);
            }
            // TODO add validation here
            if (typeof val !== 'number' || !Number.isInteger(val)) {
                throw new Error(
                    `${val} is not a valid integer for column ${colid}`
                );
            }
            checkMinMax(config, val);
            return val;
        case 'float':
            if (typeof val === 'string') {
                val = parseFloat(val);
            }
            if (typeof val !== 'number') {
                throw new Error(
                    `${val} is not a valid float for column ${colid}`
                );
            }
            checkMinMax(config, val);
            return val;
        case 'date':
            return val;
        case 'json':
            return JSON.stringify(val);
        case 'array':
            // validate each val in the array
            if (!Array.isArray(val)) {
                throw new Error(
                    `${val} is not a valid array for column ${colid}`
                );
            }
            let arrayConf = config.arrayContent;
            let vals = val.map(ea => {
                return getCellValue(arrayConf, ea);
            });
            // make into array syntax for postgres
            return `{${vals.join(', ')}}`;
        case 'bool':
        case 'boolean':
            return val;
        default:
            throw new Error(
                `unsupported data type ${config.dataType} for column ${colid}`
            );
    }
    return;
};

const getDiff = (existing, incoming) => {
    const existingIds = existing.map(x => x.id);
    let toDeleteIds;
    let toUpdate = [];
    let toCreate = [];
    if ((existing.length = 0)) {
        toCreate = incoming;
        toDeleteIds = [];
    } else {
        let newIds = [];
        // loop through new variants and put stuff in the right arrays
        incoming.forEach(ea => {
            newIds.push(ea.id);
            if (existingIds.includes(ea.id)) {
                toUpdate.push(ea);
            } else {
                toCreate.push(ea);
            }
        });
        toDeleteIds = existingIds.filter(x => !newIds.includes(x));
    }
    return { toDeleteIds, toUpdate, toCreate };
};

const naiveWrapper = (parallel, db, queries, cb) => {
    if (!cb) {
        cb = () => {};
    }
    try {
        let _tasks = queries.map(query => {
            return c1 => {
                db.pool.query(query, err => {
                    if (err) {
                        c1(err);
                    } else {
                        c1();
                    }
                });
            };
        });
        if (parallel) {
            async.parallel(_tasks, cb);
        } else {
            async.waterfall(_tasks, cb);
        }
    } catch (e) {
        cb(e);
    }
};

const addIdsAndInherits = (db, tableId, rows, inherits) => {
    let backToObj = false;
    if (!Array.isArray(rows)) {
        rows = [rows];
        backToObj = true;
    }
    const tableConfig = db.tables[tableId];
    const keyProp = tableConfig.key;

    rows = rows.map(row => {
        // add a uuid as the key if its not present and tableConfig.generateUUID is true
        if (tableConfig.generateUUID && !row[keyProp]) {
            row[keyProp] = uuid();
        }
        if (inherits) {
            row = Object.assign(row, inherits);
        }
        return row;
    });

    if (tableConfig.subTables) {
        // go through subtables and add their ids
        tableConfig.subTables.forEach(subTable => {
            rows = rows.map(row => {
                let inherits = {};
                inherits[subTable.parentid] = row[keyProp];
                if (subTable.inherits) {
                    subTable.inherits.forEach(prop => {
                        inherits[prop] = row[prop];
                    });
                }
                row[subTable.id] = addIdsAndInherits(
                    db,
                    subTable.id,
                    row[subTable.id],
                    inherits
                );
                return row;
            });
        });
    }

    return backToObj ? rows[0] : rows;
};

const fixOutputData = (outputData, tableConfig) => {
    const { sortBy, mapOnRetrieve } = tableConfig;

    if (sortBy) {
        outputData = outputData.sort((a, b) =>
            a[sortBy] > b[sortBy] ? 1 : -1
        );
    }
    if (mapOnRetrieve) {
        outputData = outputData.map(mapOnRetrieve);
    }
    return outputData;
};

module.exports = {
    addIdsAndInherits,
    isGuid,
    indexArr,
    getColumnsList,
    getFilterString,
    getUpdateString,
    getCellValue,
    getDiff,
    naiveWrapper,
    fixOutputData
};
