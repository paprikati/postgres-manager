const async = require('async');
const format = require('pg-format');

const isGuid = str => {
    let regex = RegExp(/^(\{{0,1}([0-9a-fA-F]){8}-([0-9a-fA-F]){4}-([0-9a-fA-F]){4}-([0-9a-fA-F]){4}-([0-9a-fA-F]){12}\}{0,1})$/);
    return regex.test(str);
};

const indexArr = (arr, prop) => {
    const output = {};
    arr.forEach(item => {
        let val = item[prop];
        if (output[val]){
            output[val].push(item);
        } else {
            output[val] = [item];
        }
    });
    return output;
};

const getColumnsList = (columns, tableColumns) => {
    if (!columns){
        return '*';
    } else {
        return columns.filter(col => tableColumns[col]).join(', ');
    }
};

const getFilterString = (_filter) => {
    console.log(_filter);
    let filterString = '';
    if (typeof _filter === 'string'){
        filterString = 'WHERE ' + _filter;
    } else if (typeof _filter === 'object') {
        let filterArr = Object.entries(_filter).map(([col, val]) => {
            if (Array.isArray(val)){
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
    return Object.keys(data).filter(col => columnsToUpdate.includes(col)).map(col => {
        let cellValue = getCellValue(columnConfig[col], data[col]);
        return format('%I = %L', col, cellValue);
    }).join(', ');
};

const getCellValue = (config, val) =>{
    if (val === undefined){
        return undefined;
    }

    switch (config.dataType){
        case 'uuid':
            if (!isGuid(val)){
                throw new Error(`String ${val} is not a valid uuid`);
            }
            return val;
        case 'varchar':
            if (val && val.length > config.maxLength){
                throw new Error(`String ${val} exceeds length limit ${config.maxLength}`);
            }
            return val;
        case 'int':
            // TODO add validation here
            return val;
        case 'json':
            return JSON.stringify(val);
        case 'boolean':
            return val;
        default:
            throw new Error(`unsupported data type ${config.dataType}`);
    }
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
    if (!cb){
        cb = () => {};
    }
    try {
        let _tasks = queries.map(query => {
            // DEBUG:
            // console.log(query);
            return c1 => {
                db.pool.query(query, err => {
                    if (err){
                        c1(err);
                    } else {
                        c1();
                    }
                });
            };
        });
        if (parallel){
            async.parallel(_tasks, cb);
        } else {
            console.log('running waterfall');
            async.waterfall(_tasks, cb);
        }
    } catch (e){
        cb(e);
    }
};

module.exports = {isGuid, indexArr, getColumnsList, getFilterString, getUpdateString, getCellValue, getDiff, naiveWrapper};
