module.exports = {
    users: {
        columns: {
            id: {
                isKey: true,
                dataType: 'uuid'
            },
            username: {
                mandatory: true,
                dataType: 'varchar',
                maxLength: 50
            },
            role: {
                mandatory: true,
                dataType: 'array',
                arrayContent: {
                    dataType: 'varchar',
                    maxLength: 30
                }
            }
        },
        indexes: {}
    }
};

// if isKey = true, must be mandatory and unique
