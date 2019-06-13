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

Things like insert have two different modes
1. Naive (do everything as fast as possible) - this is the default. It will not wait for specific calls to be successful (but will ensure all queries pass validation)
2. Careful (do everything in the 'right' order) - to do.


