const H = {};

['json', 'bool', 'uuid', 'date', 'int', 'text', 'float'].forEach(dataType => {
    H[dataType] = (editable = true, mandatory = false) => ({
        dataType,
        editable,
        mandatory
    });
});

H.str = (maxLength, editable = true, mandatory = false) => ({
    dataType: 'varchar',
    maxLength,
    editable,
    mandatory
});

H.intBetween = (min, max, editable = true, mandatory = false) => ({
    min,
    max,
    dataType: 'int',
    editable,
    mandatory
});

H.floatBetween = (min, max, editable = true, mandatory = false) => ({
    min,
    max,
    dataType: 'float',
    editable,
    mandatory
});

H.arrayOf = (arrayContent, editable = true, mandatory = false) => ({
    dataType: 'array',
    arrayContent: arrayContent,
    editable,
    mandatory
});

H.uuidKey = () => ({ isKey: true, dataType: 'uuid', editable: false });

H.strKey = maxLength => ({ isKey: true, dataType: 'varchar', maxLength });

module.exports = H;
