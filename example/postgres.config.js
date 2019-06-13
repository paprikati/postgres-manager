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
        subTables: [
            'meals'
        ],
        indexes: {}
    },
    meals: {
        columns: {
            id: {
                isKey: true,
                dataType: 'uuid'
            },
            mealtype: {
                mandatory: true,
                dataType: 'varchar',
                maxLength: 30
            },
            planid: {
                isKey: true,
                dataType: 'uuid'
            }
        }
    }
};
