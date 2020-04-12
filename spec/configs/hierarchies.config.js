const H = require('../../src/helpers');

module.exports = {
    grandparents: {
        columns: {
            id: H.uuidKey(),
            name: H.str(50)
        },
        subTables: [
            {
                id: 'parents',
                parentid: 'grandparent_id'
            }
        ]
    },
    parents: {
        columns: {
            id: H.uuidKey(),
            grandparent_id: H.uuid(),
            name: H.str(50)
        },
        subTables: [
            {
                id: 'children',
                inherits: ['grandparent_id'],
                parentid: 'parent_id'
            },
            {
                id: 'homes',
                prop: 'home',
                inherits: ['grandparent_id'],
                parentid: 'parent_id',
                oneToOne: true
            }
        ]
    },
    children: {
        columns: {
            id: H.uuidKey(),
            parent_id: H.uuid(),
            grandparent_id: H.uuid(),
            name: H.str(50)

        }
    },
    homes: {
        columns: {
            id: H.uuidKey(),
            parent_id: H.uuid(),
            grandparent_id: H.uuid(),
            name: H.str(50)
        }
    }
};

