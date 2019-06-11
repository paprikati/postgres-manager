module.exports = {
    plans: {
        columns: {
            id: {
                isKey: true,
                dataType: 'uuid'
            },
            title: {
                mandatory: true,
                dataType: 'varchar',
                maxLength: 100
            },
            owner: {
                mandatory: false,
                dataType: 'uuid'
            }
        },
        indexes: {}
    }
};
