module.exports = {
    parents: {
        generateUUID: true,
        deleteConfig: {
            shallow: 'sometimes',
            hard: 'never', // can be always or sometimes
            tableId: 'deleted_parents'
        },
        columns: {
            id: {
                isKey: true,
                dataType: 'int'
            },
            name: {
                mandatory: true,
                dataType: 'varchar',
                maxLength: 30,
                editable: true
            }
        },
        subTables: [
            {
                id: 'children',
                parentid: 'parentid'
            }
        ]
    },
    children: {
        generateUUID: true,
        deleteConfig: {
            tableId: 'deleted_children',
            columns: ['id', 'parentid', 'name']
        },
        columns: {
            id: {
                isKey: true,
                dataType: 'int'
            },
            parentid: {
                dataType: 'int',
                mandatory: true
            },
            name: {
                mandatory: true,
                dataType: 'varchar',
                maxLength: 30,
                editable: true
            },
            gender: {
                editable: true,
                dataType: 'boolean'
            },
            testarr: {
                dataType: 'array',
                arrayContent: {
                    dataType: 'varchar',
                    maxLength: 10
                },
                editable: true
            }
        },
        subTables: [
            {
                id: 'grandchildren',
                parentid: 'parentid'
            }
        ]
    },
    grandchildren: {
        deleteConfig: {
            hard: 'always',
            shallow: 'always'
        },
        columns: {
            id: {
                isKey: true,
                dataType: 'int'
            },
            parentid: {
                dataType: 'int',
                mandatory: true
            },
            name: {
                mandatory: true,
                dataType: 'varchar',
                maxLength: 30,
                editable: true
            }
        }
    },
    plans: {
        columns: {
            id: {
                isKey: true,
                dataType: 'uuid'
            },
            title: {
                mandatory: true,
                dataType: 'varchar',
                maxLength: 100,
                editable: true
            },
            owner: {
                mandatory: false,
                dataType: 'uuid',
                editable: true
            }
        },
        subTables: [
            {
                id: 'meals',
                parentid: 'planid'
            }
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
                maxLength: 30,
                editable: true
            },
            planid: {
                mandatory: true,
                dataType: 'uuid'
            }
        }
    }
};
