module.exports = function(db, callback) {
    let listOfTableIds = [];
    Object.entries(db.tables).forEach(([tableId, tableConf]) => {
        listOfTableIds.push(tableId);

        if (tableConf.deleteConfig && tableConf.deleteConfig.tableId) {
            listOfTableIds.push(tableConf.deleteConfig.tableId);
        }
    });

    let finalSQL = `DROP TABLE ${listOfTableIds.join(',')}`;

    db.pool.query(finalSQL, callback);
};
