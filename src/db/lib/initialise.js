module.exports = function(db, callback) {
    const sqlArray = [];

    Object.entries(db.tables).forEach(([tableId, tableConf]) => {
        let columns = Object.entries(tableConf.columns)
            .map(([columnId, columnConfig]) => {
                let sqlType = getSqlType(columnConfig);
                let constraints = '';
                if (columnConfig.isKey) {
                    constraints = ' PRIMARY KEY UNIQUE NOT NULL';
                } else if (columnConfig.mandatory) {
                    constraints = ' NOT NULL';
                }
                return `    "${columnId}" ${sqlType}${constraints}`;
            })
            .join(',\n');

        sqlArray.push(`CREATE TABLE ${tableId} (\n${columns}\n);`);

        if (tableConf.deleteConfig && tableConf.deleteConfig.tableId) {
            let columns = [
                `    "${tableConf.deleteConfig.keyColumn}" uuid PRIMARY KEY NOT NULL`,
                `    "${tableConf.deleteConfig.valColumn}" json NOT NULl`
            ].join(',\n');

            // if it needs a backup
            sqlArray.push(
                `CREATE TABLE ${tableConf.deleteConfig.tableId} (\n${columns}\n);`
            );
        }
    });

    let finalSQL = sqlArray.join('\n\n');

    const fs = require('fs');
    fs.writeFileSync('./structure.sql', finalSQL);

    db.pool.query(finalSQL, callback);
};

function getSqlType(config) {
    switch (config.dataType) {
        case 'varchar':
            if (!config.maxLength) {
                console.log(config);
                throw 'maxLength must be specified';
            }
            return `varchar(${config.maxLength})`;
        case 'date':
        case 'timestamp':
            return 'timestamp without time zone';
        case 'float':
            return 'double precision';
        case 'int':
            return 'smallint';
        case 'smallint':
        case 'bigint':
        case 'text':
        case 'uuid':
        case 'json':
            return config.dataType;
        case 'bool':
        case 'boolean':
            return 'boolean';
        case 'array':
            return `${getSqlType(config.arrayContent)}[]`;
        default:
            console.log('unsupported data type');
            console.log(config);
            throw 'Unsupported data type';
    }
}
