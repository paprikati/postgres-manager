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

### `db.update`

```js
db.update('mytable',{_filter:{id:123}, data:{newCol:'newVal'}})
```

* `data` - an object with the data you want to update on the nodes
* `_filter` - an object defining which nodes you want to update
* `columns` - which columns you want to update (only required in strict mode)
* `strict` - is the update in strict mode?

### `db.deleteById`

* `id` - a single id to delete
* `ids` - an array of objects to delete
* `hard` - should the row be saved in a 'deleted' table somewhere?
* `shallow` - should child rows also be deleted