const editableJSON = { editable: true, dataType: 'json' };
const editManUUID = { editable: true, dataType: 'uuid', mandatory: true };
const fixedUUID = { editable: false, dataType: 'uuid', mandatory: true };
const key = { isKey: true, dataType: 'uuid' };
const basicInt = {
    dataType: 'int',
    min: 0,
    max: 100,
    editable: true
};
const editManStr30 = {
    dataType: 'varchar',
    maxLength: 30,
    editable: true,
    mandatory: true
};

module.exports = {
    plans: {
        columns: {
            id: key,
            title: {
                mandatory: true,
                dataType: 'varchar',
                maxLength: 100,
                editable: true
            },
            startdate: {
                dataType: 'date',
                editable: true
            },
            enddate: {
                dataType: 'date',
                editable: true
            },
            owner: editManUUID,
            dietgroups: editableJSON,
            headcounts: editableJSON,
            specials: editableJSON
        },
        subTables: [
            {
                id: 'meals',
                parentid: 'planid'
            }
        ],
        indexes: {},
        generateUUID: true,
        deleteConfig: {
            tableId: 'deleted_plans',
            condense: 'always',
            valColumn: 'plan',
            keyColumn: 'id'
        }
    },
    meals: {
        columns: {
            id: key,
            day: {
                dataType: 'int',
                min: 0,
                max: 100,
                editable: true
            },
            displayorder: {
                dataType: 'int',
                min: 0,
                max: 100,
                editable: true
            },
            mealtype: {
                mandatory: true,
                dataType: 'varchar',
                maxLength: 30,
                editable: true
            },
            headcount_modifier: editableJSON,
            courses: {
                dataType: 'json',
                editable: true
            },
            planid: {
                mandatory: true,
                dataType: 'uuid'
            }
        },
        subTables: [
            {
                id: 'recipe_records',
                parentid: 'mealid',
                inherits: ['planid']
            }
        ],
        sortBy: 'displayorder',
        generateUUID: true
    },
    recipe_records: {
        columns: {
            id: {
                isKey: true,
                dataType: 'uuid'
            },
            planid: fixedUUID,
            mealid: editManUUID,
            recipeid: editManUUID,
            variantid: editManUUID,
            notes: {
                dataType: 'text',
                editable: true
            },
            displayorder: basicInt,
            headcount_modifier: editableJSON,
            dietgroups: {
                dataType: 'array',
                arrayContent: {
                    dataType: 'varchar',
                    maxLength: 10
                },
                editable: true
            }
        },
        sortBy: 'displayorder',
        generateUUID: true
    },
    recipes: {
        columns: {
            id: key,
            owner: editManUUID,
            recipetype: {
                dataType: 'varchar',
                maxLength: 30,
                mandatory: true,
                editable: true
            },
            serves: {
                dataType: 'int',
                max: 500,
                editable: true,
                mandatory: true
            },
            tags: {
                dataType: 'array',
                arrayContent: {
                    dataType: 'varchar',
                    maxLength: 40
                }
            },
            searchinfo: editableJSON
        },
        subTables: [
            {
                id: 'variants',
                parentid: 'recipeid'
            }
        ],
        generateUUID: true,
        deleteConfig: {
            tableId: 'deleted_recipes',
            condense: 'always',
            valColumn: 'recipe',
            keyColumn: 'id'
        }
    },
    variants: {
        columns: {
            id: key,
            recipeid: fixedUUID,
            title: {
                dataType: 'varchar',
                maxLength: 100,
                mandatory: true,
                editable: true
            },
            label: {
                dataType: 'varchar',
                maxLength: 30,
                mandatory: false,
                editable: true
            },
            method: {
                dataType: 'text',
                editable: true
            },
            ingredientgroups: editableJSON,
            displayorder: basicInt
        },
        subTables: [
            {
                id: 'ingredients',
                parentid: 'variantid',
                inherits: ['recipeid']
            }
        ],
        generateUUID: true,
        sortBy: 'displayorder'
    },
    ingredients: {
        columns: {
            id: key,
            variantid: editManUUID,
            recipeid: fixedUUID,
            displayorder: basicInt,
            quantity: {
                dataType: 'float',
                min: 0,
                editable: true,
                mandatory: true
            },
            foodid: editManUUID
        },
        generateUUID: true,
        sortBy: 'displayorder'
    },
    foods: {
        columns: {
            id: key,
            foodname: editManStr30,
            unit: editManStr30,
            foodtype: editManStr30,
            allergens: {
                dataType: 'array',
                arrayContent: {
                    dataType: 'varchar',
                    maxLength: 30
                },
                editable: true,
                mandatory: false
            },
            approved: {
                dataType: 'bool',
                editable: true
            }
        },
        mapOnRetrieve: row => {
            row.allergens = row.allergens || [];
            return row;
        },
        generateUUID: true
    }
};
