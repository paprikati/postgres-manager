const fs = require('fs-extra');
const PG = require('../../src');

function initialiseDB(tables, callback){
    const db = getDB(tables);
    db.drop(() => {
        db.clearQueryLog();
        db.initialise(callback);
    });
}

function getDB(tables){
    const dbConf = {
        user: 'postgres',
        host: process.env.DB_HOST,
        database: 'test',
        password: 'abc123',
        port: process.env.DB_PORT
    };

    return PG.connect({ tables, db: dbConf });
}

function reviewSql(db, key){
    let rawSql = db.queryLog.join('\n');
    let receivedSql = cleanSql(rawSql);

    // find if there's a sql file
    let filePath = `${__dirname}/../fixtures/sql/${key}`;
    let toReviewPath = `${filePath}.review.sql`;
    fs.ensureFileSync(toReviewPath);
    fs.writeFileSync(toReviewPath, receivedSql, 'utf8');
}

function itIssuesCorrectSql(toPrepare, key, db){
    it(key + ': issues correct sql', function(done) {
        db.clearQueryLog();
        toPrepare(() => {
            let rawSql = db.queryLog.join('\n');
            let receivedSql = cleanSql(rawSql);

            // find if there's a sql file
            let filePath = `${__dirname}/../fixtures/sql/${key}`;
            let approvedPath = `${filePath}.approved.sql`;
            let receivedPath = `${filePath}.received.sql`;

            if (fs.existsSync(approvedPath)){
                let approvedSql = fs.readFileSync(approvedPath, 'utf8').trim();
                if (approvedSql != receivedSql){
                    fs.writeFileSync(receivedPath, receivedSql, 'utf8');
                }
                expect(approvedSql).toEqual(receivedSql);
                done();
            } else {
                fs.ensureFileSync(approvedPath);
                fs.writeFileSync(approvedPath, receivedSql, 'utf8');
                done();
            }
        });
    });
}

function cleanSql(sql){
    var guidRegex = /.([0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12})./ig;

    for (let i = 1; i < 1000; i++){
        let guidToReplaceArr = sql.match(guidRegex);
        if (!guidToReplaceArr){
            break;
        }
        let guid = guidToReplaceArr[0];
        let regex = new RegExp(`.${guid.substr(1).slice(0, -1)}.`, 'g');

        sql = sql.replace(regex, `$${i}`);
    }
    return sql.trim();
}


module.exports = {
    initialiseDB,
    getDB,
    reviewSql,
    itIssuesCorrectSql
};
