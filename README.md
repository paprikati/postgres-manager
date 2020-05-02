# postgres-manager
A node framework to create, update and use postgres

## Usage
We assume that you are using `pg` to communicate with the postgres db.
Therefore, when you initialise the manager, you need to pass us the pool or client you want us to query with.

## Configuration
To configure your manager, you will need to build a config object.
This will look like
```js
{
    table1:{...stuff},
    table2:{...stuff},
}
```

### Columns
Each table will have a number of columns:
```js
var a = table1:{
    columns:{
        key:{
            dataType:'uuid',
            isKey:true
        },
        name:{
            dataType:'varchar',
            maxLength:30,
            mandatory:true,
            unique:false
        }
    }
}
```
We can passthrough the dataType value so can in theory support anything in the postgres documentation. However, we only really support a smaller subset of types where we apply validation rules.

So far we support:
* bigint
* boolean
* date
* int
* json
* serial
* smallint
* text
* timestamp (not Z!)
* uuid
* varchar

we also support arrays of all of the above types.

note that for varchars, you pass an extra parameter
`{dataType:'varchar', maxLength:30}`;

additionally, for arrays:
```js
{dataType:'array', arrayContent:'int'}

//OR

{
    dataType:'array',
    arrayContent: {
        dataType: 'varchar',
        maxLength: 30
    }
};
```

## Using the DB Methods

### `db.insert`

Inserts a row (or rows) into the db

```js
db.insert('people', [{id:1, name:'A'}], cb)
```

#### `db.insertWithOpts`

Supports an options argument. Currently the only supported options are:
* `ignoreConflicts` - if true, will ignore conflicts and return the conflicting resource (a bit like getOrInsert)

```js
db.insertWithOpts('people', [{id:1, name:'A'}], {ignoreConflicts:true}, cb)
```

#### `db.insertAndPrep`

Supports a `prep` function to apply to the data before it is returned

```js
db.insertAndPrep('people', [{id:1, name:'A'}], data => data[0], cb)
```

### `db.updateBulk`

This runs a bulk update, but only ever on a single table. If you want to update an object
and its children, then use `updateById`.

```js
db.updateBulk('mytable',{_filter:{id:123}, data:{newCol:'newVal'}}, cb)
```
Options:

* `data` - an object with the data you want to update on the nodes
* `_filter` - an object defining which nodes you want to update
* `columns` - which columns you want to update (only required in strict mode)
* `strict` - is the update in strict mode?

Note - updates run in parallel, so don't return a response object

#### `db.updateById`

```js
db.updateById('mytable',{newCol:'newVal', id:123}, cb);
```

#### `db.updateByIdShallow`

Ignores any subtables

```js
db.updateByIdShallow('mytable',{newCol:'newVal', id:123}, cb);
```


### `db.get` OR `db.retrieve`

```js
db.get('people', { _filter: { id: 234 } }, cb);
```

Options:
- `_filter` - an object defining which nodes you want to retrieve
- `shallow` - if true, it won't get any 'child' records - i.e. it will only hit one table
- `index` - if true, it will return the objects as a dictionary using the IDs, rather than as an array.

### `db.getById`

```js
db.getById('people',{id: 123}, cb);
```

Options:
- `id` - the id of the record
- `shallow` - if true, it won't get any 'child' records - i.e. it will only hit one table

#### `db.getAndPrep`

Supports a `prep` function to apply to the data before it is returned

```js
db.getAndPrep('people', { _filter: { id: 234 } }, data => data[0], cb);
```

### `db.delete`

```js
 db.delete('people', { _filter: { id: 123 } }, cb);
```

* `_filter` - an object defining which nodes you want to delete
* `hard` - should the row be saved in a 'deleted' table somewhere? (defaults to false)
* `shallow` - should child rows also be deleted

### `db.deleteById`

```js
db.deleteById('people',  { id: seedId }, cb);
```

* `id` - a single id to delete
* `ids` - an array of ids to delete
* `hard` - should the row be saved in a 'deleted' table somewhere? (defaults to false)
* `shallow` - should child rows also be deleted

## Utility functions

### `db.query`

Issues your query 'blindly'

### `db.initialise`

Creates all the tables specified in your config

### `db.reset`

Removes all the data from your tables

### `db.drop`

Drops all the tables from your database

### `db.queryLog`

Stores (as an array) the strings exactly as they are sent to the database

### `db.clearQueryLog`

Clears the query log
