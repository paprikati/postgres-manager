const isGuid = str => {
    let regex = RegExp(/^(\{{0,1}([0-9a-fA-F]){8}-([0-9a-fA-F]){4}-([0-9a-fA-F]){4}-([0-9a-fA-F]){4}-([0-9a-fA-F]){12}\}{0,1})$/);
    return regex.test(str);
};


module.exports = {isGuid};
